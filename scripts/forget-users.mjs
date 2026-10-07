// One-time "forgetting" cleanup: wipes users who never became paying, approved users.
//
// Usage:
//   node -r dotenv/config scripts/forget-users.mjs scan  dotenv_config_path=.env.local
//     -> read-only. Writes forget_list.txt with every user that would be wiped.
//   node -r dotenv/config scripts/forget-users.mjs wipe  dotenv_config_path=.env.local
//     -> deletes ONLY the userIds listed in forget_list.txt, and only if they still
//        match a forget rule right now. Wipes from BOTH primary and backup DB.
//
// Forget rules (admins and anyone ever approved are NEVER forgotten):
//   1. No payment submitted and signed up more than 24h ago.
//   2. Payment still pending and the latest submission is more than 4 days old.
//   3. Latest payment rejected (no pending/confirmed) more than 24h ago.
//      Older records have no rejectedAt timestamp, so submittedAt is used instead.
import { Redis } from "@upstash/redis";
import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const mode = process.argv[2] || "scan";
const LIST_FILE = process.env.FORGET_LIST || "forget_list.txt";
const HOUR = 60 * 60 * 1000;
const NO_PAYMENT_MS = 24 * HOUR;
const PENDING_MS = 4 * 24 * HOUR;
const REJECTED_MS = 24 * HOUR;

function client(url, token) {
  return url && token ? new Redis({ url, token }) : null;
}
const primary = client(process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN);
const backup = client(process.env.UPSTASH_REDIS_BACKUP_DB_REST_URL, process.env.UPSTASH_REDIS_BACKUP_DB_REST_TOKEN);
if (!primary) {
  console.error("Missing UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}

const normalizeEmail = (e) => String(e || "").trim().toLowerCase();
const unwrap = (v) => (Array.isArray(v) && (Array.isArray(v[0]) || (v.length === 1 && v[0] && typeof v[0] === "object")) ? v[0] : v);
const ts = (s) => { const t = Date.parse(s); return Number.isFinite(t) ? t : NaN; };
const ago = (ms) => `${(ms / HOUR).toFixed(1)}h ago`;

async function scanKeys(db, match) {
  let cursor = "0";
  const keys = [];
  do {
    const [next, batch] = await db.scan(cursor, { match, count: 1000 });
    cursor = String(next);
    keys.push(...batch);
  } while (cursor !== "0");
  return keys;
}

async function readIndex(db) {
  const raw = unwrap(await db.json.get("users:index"));
  return Array.isArray(raw) ? raw : [];
}

/** Returns a reason string if the user should be forgotten, otherwise null. */
export function forgetReason(user, now = Date.now()) {
  if (!user || user.isAdmin) return null;
  const sub = user.subscription || {};
  const payments = Array.isArray(sub.payments) ? sub.payments : [];

  const everApproved =
    sub.approvalStatus === "approved" ||
    sub.status === "active" ||
    sub.status === "expired" ||
    !!sub.approvedAt ||
    payments.some((p) => p.status === "confirmed");
  if (everApproved) return null;

  if (payments.length === 0) {
    const created = ts(user.account?.createdAt);
    if (!Number.isFinite(created)) return "no payment submitted, signup date unknown";
    return now - created >= NO_PAYMENT_MS ? `no payment submitted, signed up ${ago(now - created)}` : null;
  }

  const latestSubmitted = Math.max(...payments.map((p) => ts(p.submittedAt)).filter(Number.isFinite));
  if (payments.some((p) => p.status === "pending")) {
    if (!Number.isFinite(latestSubmitted)) return "pending payment, submission date unknown";
    return now - latestSubmitted >= PENDING_MS ? `payment pending, last submitted ${ago(now - latestSubmitted)}` : null;
  }

  // All payments rejected
  const rejectedTimes = payments.map((p) => ts(p.rejectedAt ?? p.submittedAt)).filter(Number.isFinite);
  const lastRejected = rejectedTimes.length ? Math.max(...rejectedTimes) : NaN;
  if (!Number.isFinite(lastRejected)) return "payment rejected, date unknown";
  const usedFallback = !payments.some((p) => p.rejectedAt);
  return now - lastRejected >= REJECTED_MS
    ? `payment rejected ${ago(now - lastRejected)}${usedFallback ? " (by submission time; no rejection timestamp)" : ""}`
    : null;
}

async function loadAllUsers(db) {
  console.log("loadAllUsers: fetching index...");
  const index = await readIndex(db);
  console.log("loadAllUsers: scanning user keys...");
  const docKeys = await scanKeys(db, "user:*");
  console.log(`loadAllUsers: found ${docKeys.length} keys`);
  const idArray = Array.from(new Set([...index.map((u) => u.userId), ...docKeys.map((k) => k.slice(5))]));
  console.log(`loadAllUsers: fetching ${idArray.length} user documents...`);
  const users = new Map();

  const BATCH = 50;
  for (let i = 0; i < idArray.length; i += BATCH) {
    const chunk = idArray.slice(i, i + BATCH);
    const results = await Promise.all(chunk.map(id => db.json.get(`user:${id}`).catch(() => null)));
    for (let j = 0; j < chunk.length; j++) {
      users.set(chunk[j], unwrap(results[j]) || null);
    }
    if (i > 0 && i % 500 === 0) console.log(`  fetched ${i}/${idArray.length}`);
  }
  return { index, users };
}

async function scan() {
  console.log("Starting scan...");
  const now = Date.now();
  console.log("Loading users...");
  const { index, users } = await loadAllUsers(primary);
  console.log("Users loaded");
  const lines = [];
  let kept = 0;

  for (const [id, user] of users) {
    if (!user) {
      const entry = index.find((u) => u.userId === id);
      lines.push([id, entry?.email ?? "-", entry?.username ?? "-", "orphan index entry (user document missing)"]);
      continue;
    }
    const reason = forgetReason(user, now);
    if (reason) lines.push([id, user.account?.email ?? "-", user.account?.username ?? "-", reason]);
    else kept++;
  }

  const header = [
    `# PhantomPip forget list - generated ${new Date(now).toISOString()}`,
    `# Users scanned: ${users.size} | To forget: ${lines.length} | Kept: ${kept}`,
    `# Format: userId | email | username | reason`,
    `# Remove any line to spare that user, then run: scripts/forget-users.mjs wipe`,
    "",
  ];
  fs.writeFileSync(LIST_FILE, header.concat(lines.map((l) => l.join(" | "))).join("\n") + "\n");
  console.log(`Scanned ${users.size} users. ${lines.length} to forget, ${kept} kept.`);
  console.log(`List written to ${LIST_FILE}`);
}

async function wipeFrom(db, label, ids) {
  const idArray = Array.from(ids);
  console.log(`[${label}] Deleting ${idArray.length} users in bulk...`);
  const keysToDelete = idArray.map(id => `user:${id}`);
  
  for (let i = 0; i < keysToDelete.length; i += 500) {
    const chunk = keysToDelete.slice(i, i + 500);
    if (chunk.length > 0) await db.del(...chunk);
  }

  console.log(`[${label}] Cleaning up email index...`);
  const liveIds = new Set((await scanKeys(db, "user:*")).map((k) => k.slice(5)));
  const emailKeys = await scanKeys(db, "email:*");
  
  const emailsToDelete = [];
  for (let i = 0; i < emailKeys.length; i += 500) {
    const chunk = emailKeys.slice(i, i + 500);
    const targets = chunk.length > 0 ? await db.mget(...chunk) : [];
    for (let j = 0; j < chunk.length; j++) {
      if (!liveIds.has(String(targets[j]))) {
        emailsToDelete.push(chunk[j]);
      }
    }
  }

  if (emailsToDelete.length > 0) {
    for (let i = 0; i < emailsToDelete.length; i += 500) {
      const chunk = emailsToDelete.slice(i, i + 500);
      if (chunk.length > 0) await db.del(...chunk);
    }
  }

  const index = await readIndex(db);
  const remaining = index.filter((u) => !ids.has(u.userId));
  await db.json.set("users:index", "$", remaining);

  console.log(`[${label}] Wiped ${ids.size} users, cleaned ${emailsToDelete.length} emails. Index: ${index.length} -> ${remaining.length}`);
}

async function wipe() {
  if (!fs.existsSync(LIST_FILE)) {
    console.error(`${LIST_FILE} not found. Run "scan" first.`);
    process.exit(1);
  }
  const listed = fs.readFileSync(LIST_FILE, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith("#"))
    .map((l) => l.split("|")[0].trim());

  // Re-check each user right now so nobody approved since the scan gets wiped.
  console.log(`Re-checking ${listed.length} users...`);
  const now = Date.now();
  const ids = new Set();
  
  const BATCH = 50;
  for (let i = 0; i < listed.length; i += BATCH) {
    const chunk = listed.slice(i, i + BATCH);
    const results = await Promise.all(chunk.map(id => primary.json.get(`user:${id}`).catch(() => null)));
    for (let j = 0; j < chunk.length; j++) {
      const user = unwrap(results[j]);
      if (!user || forgetReason(user, now)) ids.add(chunk[j]);
      else console.log(`Skipping ${chunk[j]}: no longer matches a forget rule`);
    }
  }

  console.log(`Wiping ${ids.size} users...`);
  await wipeFrom(primary, "primary", ids);
  if (backup) await wipeFrom(backup, "backup", ids);
  else console.log("No backup DB configured; skipped.");
  console.log("Done.");
}

({ scan, wipe })[mode]?.().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); })
  ?? console.error(`Unknown mode "${mode}". Use scan or wipe.`);
