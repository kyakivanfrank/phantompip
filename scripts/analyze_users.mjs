import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(filePath) {
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

const env = parseEnv(path.resolve(process.cwd(), ".env.local"));

const primary = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY);
const backup = env.BACKUP_SUPABASE_URL ? createClient(env.BACKUP_SUPABASE_URL, env.BACKUP_SUPABASE_SERVICE_ROLE_KEY || env.BACKUP_SUPABASE_SECRET_KEY) : null;

async function fetchAll(client, table, select = "*", batchSize = 1000) {
  let all = [];
  let from = 0;
  while (true) {
    const to = from + batchSize - 1;
    const { data, error } = await client
      .from(table)
      .select(select)
      .range(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < batchSize) break;
    from += batchSize;
  }
  return all;
}

async function run() {
  console.log("=== COMPREHENSIVE LIVE DATABASE AUDIT ===");

  const [pUsers, pSubs, pPayments, pMt5] = await Promise.all([
    fetchAll(primary, "users", "id, email, username, is_admin, created_at, last_login_at"),
    fetchAll(primary, "subscriptions", "user_id, status, approval_status, plan_name, price_usd"),
    fetchAll(primary, "payments", "id, user_id, amount, method, status, submitted_at, transaction_ref"),
    fetchAll(primary, "mt5_accounts", "user_id, login_id, broker_server, is_connected, is_bot_running"),
  ]);

  let bUsers = [];
  let bPayments = [];
  if (backup) {
    [bUsers, bPayments] = await Promise.all([
      fetchAll(backup, "users", "id, email, is_admin, created_at"),
      fetchAll(backup, "payments", "id, user_id, status"),
    ]);
  }

  // Cross-reference Primary vs Backup
  const bUserMap = new Set(bUsers.map(u => u.id));
  const diffUsers = pUsers.filter(u => !bUserMap.has(u.id));

  // Build maps
  const subMap = new Map(pSubs.map(s => [s.user_id, s]));
  const payMap = new Map();
  for (const p of pPayments) {
    if (!payMap.has(p.user_id)) payMap.set(p.user_id, []);
    payMap.get(p.user_id).push(p);
  }
  const mt5Map = new Map(pMt5.map(m => [m.user_id, m]));

  const admins = [];
  const keptApproved = [];
  const keptPendingApproval = [];
  const rejectedUsers = [];
  const inactiveUsers = [];

  const now = Date.now();
  const eightHoursAgo = now - 8 * 60 * 60 * 1000;
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const OFFICIAL_ADMIN = (env.ADMIN_EMAIL || "mukisamicheal088@gmail.com").toLowerCase().trim();

  for (const user of pUsers) {
    const userEmail = (user.email || "").toLowerCase().trim();
    if (userEmail === OFFICIAL_ADMIN) {
      admins.push(user);
      continue;
    }

    const payments = payMap.get(user.id) || [];
    const sub = subMap.get(user.id);

    const isApproved = sub && (sub.approval_status === "approved" || sub.status === "active");
    const isPendingApproval = !isApproved && (
      (sub && (sub.approval_status === "pending" || sub.status === "pending")) ||
      payments.some(p => p.status === "pending")
    );

    if (isApproved) {
      keptApproved.push({
        id: user.id,
        email: user.email,
        username: user.username,
        subStatus: sub?.status,
        subApproval: sub?.approval_status,
        paymentsCount: payments.length,
      });
    } else if (isPendingApproval) {
      keptPendingApproval.push({
        id: user.id,
        email: user.email,
        username: user.username,
        subStatus: sub?.status,
        subApproval: sub?.approval_status,
        paymentsCount: payments.length,
        hasPendingPayment: payments.some(p => p.status === "pending"),
      });
    } else {
      // Neither approved nor pending approval: includes rejected and zero-interaction accounts
      const isRejected = (sub && sub.approval_status === "rejected") || payments.some(p => p.status === "rejected");
      const createdTs = new Date(user.created_at).getTime();
      const userItem = {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at,
        createdHoursAgo: ((now - createdTs) / (1000 * 60 * 60)).toFixed(1),
        isOlderThan8h: createdTs < eightHoursAgo,
        isOlderThan24h: createdTs < twentyFourHoursAgo,
        isRejected,
        subStatus: sub?.status,
        subApproval: sub?.approval_status,
        paymentsCount: payments.length,
      };

      if (isRejected) {
        rejectedUsers.push(userItem);
      } else {
        inactiveUsers.push(userItem);
      }
    }
  }

  const totalToDelete = rejectedUsers.length + inactiveUsers.length;

  console.log(`\n========================================================`);
  console.log(`PRIMARY DATABASE AUDIT (RETENTION: APPROVED / PENDING ONLY):`);
  console.log(`--------------------------------------------------------`);
  console.log(`  Total Registered Accounts: ${pUsers.length}`);
  console.log(`  Admin Accounts (protected): ${admins.length}`);
  admins.forEach(a => console.log(`    - ${a.email} (${a.username || 'Admin'})`));

  console.log(`\n  ACCOUNTS TO KEEP (APPROVED OR PENDING APPROVAL):`);
  console.log(`  Approved Accounts (Active/Approved): ${keptApproved.length}`);
  console.log(`  Pending Approval Accounts: ${keptPendingApproval.length}`);
  console.log(`  ==> TOTAL PRESERVED ACCOUNTS: ${admins.length + keptApproved.length + keptPendingApproval.length}`);

  console.log(`\n  ACCOUNTS QUEUED FOR CLEANUP / DELETION:`);
  console.log(`  Rejected Accounts: ${rejectedUsers.length}`);
  rejectedUsers.forEach(r => console.log(`    - [${r.id}] ${r.email} (Payments: ${r.paymentsCount}, Sub: ${r.subStatus}/${r.subApproval})`));
  console.log(`  Inactive Accounts (Zero interaction): ${inactiveUsers.length}`);
  console.log(`  ==> TOTAL TO BE DELETED: ${totalToDelete}`);

  console.log(`\n========================================================`);
  console.log(`BACKUP DATABASE STATUS:`);
  console.log(`--------------------------------------------------------`);
  console.log(`  Total Users in Backup: ${bUsers.length}`);
  console.log(`  Total Payments in Backup: ${bPayments.length}`);

  console.log(`\nSAMPLE OF PRESERVED APPROVED ACCOUNTS (First 3):`);
  keptApproved.slice(0, 3).forEach((u, i) => {
    console.log(`  [${i + 1}] ID: ${u.id} | Email: ${u.email} | Sub: ${u.subStatus}/${u.subApproval}`);
  });

  console.log(`\nSAMPLE OF PRESERVED PENDING APPROVAL ACCOUNTS (First 3):`);
  keptPendingApproval.slice(0, 3).forEach((u, i) => {
    console.log(`  [${i + 1}] ID: ${u.id} | Email: ${u.email} | Sub: ${u.subStatus}/${u.subApproval} | Has Pending Payment: ${u.hasPendingPayment}`);
  });
}

run().catch(err => {
  console.error("Audit error:", err);
  process.exit(1);
});

