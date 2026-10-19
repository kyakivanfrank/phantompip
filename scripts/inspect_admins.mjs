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
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[key] = val;
  }
  return env;
}

const env = parseEnv(path.resolve(process.cwd(), ".env.local"));
const primary = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY);

async function main() {
  const { data: admins, error } = await primary
    .from("users")
    .select("id, email, username, is_admin, created_at, last_login_at, profile_picture")
    .eq("is_admin", true);

  if (error) {
    console.error("Error fetching admins:", error);
    return;
  }

  console.log("Found", admins.length, "admin accounts:\n");

  for (const admin of admins) {
    const { data: subs } = await primary.from("subscriptions").select("*").eq("user_id", admin.id);
    const { data: mt5 } = await primary.from("mt5_accounts").select("*").eq("user_id", admin.id);
    const { data: payments } = await primary.from("payments").select("*").eq("user_id", admin.id);

    console.log("--------------------------------------------------");
    console.log(`User ID:         ${admin.id}`);
    console.log(`Email:           ${admin.email}`);
    console.log(`Username:        ${admin.username}`);
    console.log(`Is Admin:        ${admin.is_admin}`);
    console.log(`Created At:      ${admin.created_at}`);
    console.log(`Last Login At:   ${admin.last_login_at}`);
    console.log(`Profile Picture: ${admin.profile_picture}`);
    console.log(`Subscription:    ${JSON.stringify(subs?.[0] || null)}`);
    console.log(`MT5 Account:     ${JSON.stringify(mt5?.[0] || null)}`);
    console.log(`Payments Count:  ${payments?.length || 0}`);
    if (payments?.length) {
      console.log(`Payments:        ${JSON.stringify(payments)}`);
    }
  }
  console.log("--------------------------------------------------");
}

main().catch(console.error);
