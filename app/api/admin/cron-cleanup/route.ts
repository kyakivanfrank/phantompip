export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { getPrimaryClient, getBackupClient } from "@/lib/server/supabase";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

const OFFICIAL_ADMIN = (process.env.ADMIN_EMAIL || "mukisamicheal088@gmail.com").toLowerCase().trim();

async function fetchAll(client: any, table: string, select = "*", batchSize = 1000) {
  let all: any[] = [];
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

export async function POST(req: NextRequest) {
  return handleCleanup(req);
}

export async function GET(req: NextRequest) {
  return handleCleanup(req);
}

async function handleCleanup(req: NextRequest) {
  try {
    // Verify authorization: either Vercel Cron header or CRON_SECRET or admin token
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
      return errorResponse("Unauthorized", 401);
    }

    const primary = getPrimaryClient();
    const backup = getBackupClient();

    const [users, subscriptions, payments] = await Promise.all([
      fetchAll(primary, "users", "id, email, username, is_admin, created_at"),
      fetchAll(primary, "subscriptions", "user_id, status, approval_status"),
      fetchAll(primary, "payments", "id, user_id, status"),
    ]);

    const subMap = new Map(subscriptions.map((s) => [s.user_id, s]));
    const payMap = new Map();
    for (const p of payments) {
      if (!payMap.has(p.user_id)) payMap.set(p.user_id, []);
      payMap.get(p.user_id).push(p);
    }

    const now = Date.now();
    const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
    const cutoff = now - EIGHT_HOURS_MS;

    const toDeleteIds: string[] = [];

    for (const user of users) {
      const email = (user.email || "").toLowerCase().trim();
      if (email === OFFICIAL_ADMIN) continue;

      const userPayments = payMap.get(user.id) || [];
      const sub = subMap.get(user.id);

      // Rule: ONLY users who are APPROVED or PENDING APPROVAL are preserved
      const isApproved = sub && (sub.approval_status === "approved" || sub.status === "active");
      const isPendingApproval = !isApproved && (
        (sub && (sub.approval_status === "pending" || sub.status === "pending")) ||
        userPayments.some((p: any) => p.status === "pending")
      );

      // Preserve approved and pending approval accounts
      if (isApproved || isPendingApproval) continue;

      // Account is neither approved nor pending approval (includes rejected and inactive)
      const isRejected = (sub && sub.approval_status === "rejected") || userPayments.some((p: any) => p.status === "rejected");
      const createdTs = new Date(user.created_at).getTime();

      // If rejected, delete immediately. If fresh signup with no action, delete if older than 8 hours
      if (!isRejected && createdTs > cutoff) continue;

      toDeleteIds.push(user.id);
    }

    if (toDeleteIds.length === 0) {
      return successResponse(
        { deleted: 0, message: "Database is clean. No inactive users older than 8 hours." },
        "Cleanup check completed",
        200
      );
    }

    // Fast parallel bulk chunk deletion
    const BULK_CHUNK_SIZE = 350;
    const chunks: string[][] = [];
    for (let i = 0; i < toDeleteIds.length; i += BULK_CHUNK_SIZE) {
      chunks.push(toDeleteIds.slice(i, i + BULK_CHUNK_SIZE));
    }

    const primaryPromises = chunks.map((chunk) =>
      primary.from("users").delete().in("id", chunk)
    );

    const backupPromises = backup
      ? chunks.map((chunk) => backup.from("users").delete().in("id", chunk))
      : [];

    await Promise.all([...primaryPromises, ...backupPromises]);

    return successResponse(
      {
        deleted: toDeleteIds.length,
        timestamp: new Date().toISOString(),
      },
      `Successfully purged ${toDeleteIds.length} inactive users`,
      200
    );
  } catch (err: any) {
    return handleApiError(err);
  }
}
