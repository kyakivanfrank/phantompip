import { createClient, SupabaseClient } from "@supabase/supabase-js";

let primaryClient: SupabaseClient | null = null;
let backupClient: SupabaseClient | null = null;
let isPrimaryHealthy = true;
let lastHealthCheck = 0;
let lastHeartbeat = 0;

const HEALTH_CHECK_INTERVAL = 30_000; // 30 seconds
const HEARTBEAT_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function getPrimaryConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  return { url, serviceKey };
}

function getBackupConfig() {
  const url = process.env.BACKUP_SUPABASE_URL;
  const serviceKey =
    process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BACKUP_SUPABASE_SECRET_KEY;

  return { url, serviceKey };
}

/**
 * Returns the primary Supabase client.
 */
export function getPrimaryClient(): SupabaseClient {
  if (!primaryClient) {
    const { url, serviceKey } = getPrimaryConfig();
    if (!url || !serviceKey) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
      );
    }

    primaryClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return primaryClient;
}

/**
 * Returns the backup Supabase client (if configured).
 */
export function getBackupClient(): SupabaseClient | null {
  if (!backupClient) {
    const { url, serviceKey } = getBackupConfig();
    const primaryConfig = getPrimaryConfig();
    if (
      !url ||
      !serviceKey ||
      !url.trim() ||
      !serviceKey.trim() ||
      url.trim() === primaryConfig.url?.trim()
    ) {
      return null;
    }

    backupClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return backupClient;
}

/**
 * Keep-alive ping to ensure the backup Supabase database is never paused for inactivity.
 */
export function triggerBackupHeartbeat(): void {
  const now = Date.now();
  if (now - lastHeartbeat < HEARTBEAT_INTERVAL) return;
  lastHeartbeat = now;

  const backup = getBackupClient();
  if (!backup) return;

  Promise.resolve(backup.from("platform_settings").select("id").limit(1))
    .then(() => {
      // Successfully pinged backup database
    })
    .catch((err) => {
      console.warn("[Backup DB Keep-Alive Warning]:", err?.message || err);
    });
}

/**
 * Returns the active Supabase client based on automated health/failover status.
 */
export function getSupabase(): SupabaseClient {
  triggerBackupHeartbeat();

  // If primary was marked unhealthy, periodically re-check if it has recovered
  const now = Date.now();
  if (!isPrimaryHealthy && now - lastHealthCheck > HEALTH_CHECK_INTERVAL) {
    lastHealthCheck = now;
    // Attempt recovery check in the background
    try {
      const primary = getPrimaryClient();
      Promise.resolve(primary.from("platform_settings").select("id").limit(1))
        .then(({ error }) => {
          if (!error) {
            console.log("[Supabase Coordinator] Primary database has recovered. Restoring primary.");
            isPrimaryHealthy = true;
          }
        })
        .catch(() => {});
    } catch {}
  }

  if (!isPrimaryHealthy) {
    const backup = getBackupClient();
    if (backup) return backup;
  }

  return getPrimaryClient();
}

/**
 * Execute a read query with automatic failover.
 * Tries the primary client first; if primary has a network/service failure,
 * automatically falls back to the backup database without failing the user request.
 */
export async function executeRead<T>(
  actionName: string,
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  triggerBackupHeartbeat();
  const backup = getBackupClient();

  if (!isPrimaryHealthy && backup) {
    try {
      return await operation(backup);
    } catch (err) {
      console.error(`[Supabase Read Error on Backup (${actionName})]:`, err);
    }
  }

  try {
    const primary = getPrimaryClient();
    return await operation(primary);
  } catch (primaryErr: any) {
    if (backup) {
      console.warn(
        `[Supabase Read Failover] Primary failed during "${actionName}". Switching to backup:`,
        primaryErr?.message || primaryErr
      );
      isPrimaryHealthy = false;
      lastHealthCheck = Date.now();
      return await operation(backup);
    }
    throw primaryErr;
  }
}

/**
 * Execute a write mutation with automatic dual-write (mirroring) and failover.
 * 1. Writes to the active primary database.
 * 2. Automatically replicates to the backup database in the background to ensure real-time sync.
 * 3. If primary is down, writes directly to backup so service remains uninterrupted.
 */
export async function executeWrite<T>(
  actionName: string,
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  triggerBackupHeartbeat();
  const backup = getBackupClient();

  // If already failed over to backup
  if (!isPrimaryHealthy && backup) {
    const result = await operation(backup);
    // Try to catch up primary in the background if possible
    try {
      const primary = getPrimaryClient();
      void operation(primary).catch(() => {});
    } catch {}
    return result;
  }

  // Execute on primary
  try {
    const primary = getPrimaryClient();
    const result = await operation(primary);

    // Automatically replicate to backup in the background
    if (backup) {
      void operation(backup).catch((backupErr) => {
        console.warn(
          `[Supabase Auto-Backup Mirror Warning] Failed to mirror "${actionName}" to backup database:`,
          backupErr?.message || backupErr
        );
      });
    }

    return result;
  } catch (primaryErr: any) {
    // If primary failed, failover to backup database immediately
    if (backup) {
      console.warn(
        `[Supabase Write Failover] Primary failed on "${actionName}". Writing to backup database:`,
        primaryErr?.message || primaryErr
      );
      isPrimaryHealthy = false;
      lastHealthCheck = Date.now();
      return await operation(backup);
    }
    throw primaryErr;
  }
}
