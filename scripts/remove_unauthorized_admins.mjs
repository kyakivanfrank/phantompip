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
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
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
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const primary = createClient(primaryUrl, primaryKey, { auth: { persistSession: false } });
const backup = backupUrl && backupKey ? createClient(backupUrl, backupKey, { auth: { persistSession: false } }) : null;

const OFFICIAL_ADMIN = "mukisamicheal088@gmail.com";

async function main() {
  console.log(`Checking for admin accounts across databases...`);
  console.log(`Official Admin: ${OFFICIAL_ADMIN}\n`);

  // Query primary
  const { data: pAdmins, error: pErr } = await primary
    .from("users")
    .select("id, email, username, is_admin, created_at, last_login_at, profile_picture")
    .eq("is_admin", true);

  if (pErr) throw pErr;

  console.log(`Primary DB Admins (${pAdmins.length}):`);
  pAdmins.forEach((a) => {
    console.log(`  - [${a.id}] ${a.email} (Username: "${a.username}", Created: ${a.created_at})`);
  });

  const unauthorizedAdmins = pAdmins.filter(
    (a) => a.email.toLowerCase().trim() !== OFFICIAL_ADMIN.toLowerCase().trim()
  );

  if (unauthorizedAdmins.length === 0) {
    console.log(`\nNo unauthorized admin accounts found. Only ${OFFICIAL_ADMIN} is admin.`);
    return;
  }

  console.log(`\nFound ${unauthorizedAdmins.length} unauthorized admin account(s) to remove:`);
  for (const admin of unauthorizedAdmins) {
    console.log(`\nDeleting admin: ${admin.email} (ID: ${admin.id})...`);

    // Delete from Primary
    const { error: pDelErr } = await primary.from("users").delete().eq("id", admin.id);
    if (pDelErr) {
      console.error(`  Error deleting from Primary: ${pDelErr.message}`);
    } else {
      console.log(`  Successfully deleted from Primary Supabase.`);
    }

    // Delete from Backup
    if (backup) {
      const { error: bDelErr } = await backup.from("users").delete().eq("id", admin.id);
      if (bDelErr) {
        console.error(`  Error deleting from Backup: ${bDelErr.message}`);
      } else {
        console.log(`  Successfully deleted from Backup Supabase.`);
      }
    }
  }

  console.log(`\nVerification complete. Single admin policy enforced.`);
}

main().catch(console.error);
