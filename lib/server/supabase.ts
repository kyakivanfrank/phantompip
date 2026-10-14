import { createClient, SupabaseClient } from "@supabase/supabase-js";

let primaryClient: SupabaseClient | null = null;
let backupClient: SupabaseClient | null = null;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  return { url, serviceKey };
}

function getBackupSupabaseConfig() {
  const url = process.env.BACKUP_SUPABASE_URL;
  const serviceKey =
    process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BACKUP_SUPABASE_SECRET_KEY;

  return { url, serviceKey };
}

/**
 * Returns the primary Supabase client authenticated with the service_role secret key.
 * Used exclusively on the server with bypass/elevated permissions.
 */
export function getSupabase(): SupabaseClient {
  if (!primaryClient) {
    const { url, serviceKey } = getSupabaseConfig();
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
 * Returns the backup Supabase client (if configured) authenticated with service_role.
 */
export function getBackupSupabase(): SupabaseClient | null {
  if (!backupClient) {
    const { url, serviceKey } = getBackupSupabaseConfig();
    if (!url || !serviceKey) {
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
