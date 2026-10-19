import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const env = { ...process.env, ...parseEnv(path.resolve(process.cwd(), ".env.local")) };

const primaryUrl = env.SUPABASE_URL;
const primaryKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
const backupUrl = env.BACKUP_SUPABASE_URL;
const backupKey = env.BACKUP_SUPABASE_SERVICE_ROLE_KEY || env.BACKUP_SUPABASE_SECRET_KEY;

if (!primaryUrl || !primaryKey) {
  console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const primary = createClient(primaryUrl, primaryKey, { auth: { persistSession: false } });
const backup = backupUrl && backupKey ? createClient(backupUrl, backupKey, { auth: { persistSession: false } }) : null;

// Parse CLI Arguments
const args = process.argv.slice(2);
const isExecute = args.includes("--execute");
const isDaemon = args.includes("--daemon") || args.includes("--loop-8h");
const olderThanArg = args.find((a) => a.startsWith("--older-than-hours="));
// Default older than hours: 0 for explicit execute (or specified), 8 for daemon mode
const olderThanHours = olderThanArg
  ? parseFloat(olderThanArg.split("=")[1])
  : isDaemon ? 8 : 0;

async function fetchAll(client, table, select = "*", batchSize = 1000) {
  let all = [];
  let from = 0;
  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await client.from(table).select(select).range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
}

export async function runCleanup({ execute = false, minAgeHours = 0 } = {}) {
  const timestamp = new Date().toISOString();
  console.log(`\n========================================================`);
  console.log(`[USER CLEANUP] Run initiated at ${timestamp}`);
  console.log(`Mode: ${execute ? "EXECUTE (LIVE DELETION)" : "DRY RUN (AUDIT PREVIEW)"}`);
  console.log(`Minimum Account Age Filter: ${minAgeHours} hours`);
  console.log(`========================================================`);

  // 1. Fetch data from primary
  const [users, subscriptions, payments] = await Promise.all([
    fetchAll(primary, "users", "id, email, username, is_admin, created_at, last_login_at"),
    fetchAll(primary, "subscriptions", "user_id, status, approval_status"),
    fetchAll(primary, "payments", "id, user_id, status, amount"),
  ]);

  const subMap = new Map(subscriptions.map((s) => [s.user_id, s]));
  const payMap = new Map();
  for (const p of payments) {
    if (!payMap.has(p.user_id)) payMap.set(p.user_id, []);
    payMap.get(p.user_id).push(p);
  }

  const now = Date.now();
  const minAgeCutoff = minAgeHours > 0 ? now - minAgeHours * 60 * 60 * 1000 : Infinity;

  const admins = [];
  const keptApproved = [];
  const keptPendingApproval = [];
  const targetInactiveUsers = [];
  const skippedRecentUsers = [];

  const OFFICIAL_ADMIN = (env.ADMIN_EMAIL || "mukisamicheal088@gmail.com").toLowerCase().trim();

  for (const user of users) {
    const userEmail = (user.email || "").toLowerCase().trim();

    // 1. Only the official admin is protected as admin
    if (userEmail === OFFICIAL_ADMIN) {
      admins.push(user);
      continue;
    }

    const userPayments = payMap.get(user.id) || [];
    const sub = subMap.get(user.id);

    // Rule: ONLY users who are APPROVED or PENDING APPROVAL are preserved
    const isApproved = sub && (sub.approval_status === "approved" || sub.status === "active");
    const isPendingApproval = !isApproved && (
      (sub && (sub.approval_status === "pending" || sub.status === "pending")) ||
      userPayments.some((p) => p.status === "pending")
    );

    if (isApproved) {
      keptApproved.push(user);
      continue;
    }

    if (isPendingApproval) {
      keptPendingApproval.push(user);
      continue;
    }

    // Account is neither approved nor pending approval (includes rejected and inactive accounts)
    const isRejected = (sub && sub.approval_status === "rejected") || userPayments.some((p) => p.status === "rejected");
    const createdTs = new Date(user.created_at).getTime();

    // If an account is explicitly rejected, delete immediately regardless of registration age
    // If it's a fresh signup with no status, apply minAgeHours grace period if configured
    if (!isRejected && minAgeHours > 0 && createdTs > minAgeCutoff) {
      skippedRecentUsers.push(user);
      continue;
    }

    targetInactiveUsers.push({ ...user, isRejected });
  }

  const rejectedCount = targetInactiveUsers.filter((u) => u.isRejected).length;
  const zeroActionCount = targetInactiveUsers.filter((u) => !u.isRejected).length;

  console.log(`\nStatistics:`);
  console.log(`  Total Users in DB: ${users.length}`);
  console.log(`  Protected Admin: ${admins.length}`);
  console.log(`  Preserved Approved Users: ${keptApproved.length}`);
  console.log(`  Preserved Pending Approval Users: ${keptPendingApproval.length}`);
  console.log(`  ==> Total Users Preserved: ${admins.length + keptApproved.length + keptPendingApproval.length}`);
  if (minAgeHours > 0) {
    console.log(`  Skipped (Brand new unverified signups < ${minAgeHours}h): ${skippedRecentUsers.length}`);
  }
  console.log(`  >>> Total Accounts to be deleted: ${targetInactiveUsers.length}`);
  console.log(`      - Rejected Accounts: ${rejectedCount}`);
  console.log(`      - Inactive / Zero Interaction: ${zeroActionCount}`);

  if (targetInactiveUsers.length === 0) {
    console.log(`\nNo inactive users match deletion criteria. Database is already clean.`);
    return { targetCount: 0, deletedPrimary: 0, deletedBackup: 0 };
  }

  if (!execute) {
    console.log(`\n[DRY RUN] No changes made to database.`);
    console.log(`To execute deletion, run with: node scripts/cleanup_inactive_users.mjs --execute`);
    return { targetCount: targetInactiveUsers.length, deletedPrimary: 0, deletedBackup: 0 };
  }

  // EXECUTE BULK COLLECTION DELETION
  console.log(`\nExecuting fast bulk deletion of ${targetInactiveUsers.length} users in parallel collections...`);
  const userIds = targetInactiveUsers.map((u) => u.id);
  const BULK_CHUNK_SIZE = 350; // Optimized size to stay safely under URI limits while running in parallel
  const chunks = [];
  for (let i = 0; i < userIds.length; i += BULK_CHUNK_SIZE) {
    chunks.push(userIds.slice(i, i + BULK_CHUNK_SIZE));
  }

  const startTime = Date.now();

  // Execute all bulk chunks in parallel across Primary and Backup
  let deletedPrimaryCount = 0;
  let deletedBackupCount = 0;

  const primaryPromises = chunks.map(async (chunk, idx) => {
    const { error } = await primary.from("users").delete().in("id", chunk);
    if (error) {
      console.error(`Error deleting bulk chunk ${idx + 1} from Primary:`, error.message);
    } else {
      deletedPrimaryCount += chunk.length;
    }
  });

  const backupPromises = backup
    ? chunks.map(async (chunk, idx) => {
        const { error } = await backup.from("users").delete().in("id", chunk);
        if (error) {
          console.error(`Error deleting bulk chunk ${idx + 1} from Backup:`, error.message);
        } else {
          deletedBackupCount += chunk.length;
        }
      })
    : [];

  await Promise.all([...primaryPromises, ...backupPromises]);

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\nBulk Deletion Complete in ${elapsedSeconds}s:`);
  console.log(`  Deleted from Primary Database: ${deletedPrimaryCount} / ${targetInactiveUsers.length}`);
  if (backup) {
    console.log(`  Deleted from Backup Database: ${deletedBackupCount} / ${targetInactiveUsers.length}`);
  }
  console.log(`  Finished at: ${new Date().toISOString()}`);

  return { targetCount: targetInactiveUsers.length, deletedPrimary: deletedPrimaryCount, deletedBackup: deletedBackupCount };
}

async function start() {
  if (isDaemon) {
    console.log(`Starting standby 8-hour daemon loop...`);
    // Run immediately first
    await runCleanup({ execute: isExecute, minAgeHours: olderThanHours });

    const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
    console.log(`\nDaemon standby active. Next cleanup scheduled in 8 hours.`);
    setInterval(async () => {
      try {
        console.log(`\n[Scheduled 8-Hour Trigger] Running automated cleanup...`);
        await runCleanup({ execute: isExecute, minAgeHours: 8 });
      } catch (err) {
        console.error(`Error during scheduled cleanup:`, err);
      }
    }, EIGHT_HOURS_MS);
  } else {
    await runCleanup({ execute: isExecute, minAgeHours: olderThanHours });
  }
}

import { fileURLToPath } from "url";

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  start().catch((err) => {
    console.error("Cleanup script failed:", err);
    process.exit(1);
  });
}
