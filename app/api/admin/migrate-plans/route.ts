export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser, updateSubscription } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

/**
 * POST /api/admin/migrate-plans
 *
 * One-time migration endpoint — assigns existing users to the Starter plan
 * if they don't already have a recognized plan. Admin-only.
 */
export async function POST(_req: NextRequest) {
  try {
    await requireAdmin();

    const allUsers = await getAllUsers();
    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const entry of allUsers) {
      try {
        const user = await getUser(entry.userId);
        if (!user) {
          skippedCount++;
          continue;
        }

        // Skip admin users
        if (user.isAdmin) {
          skippedCount++;
          continue;
        }

        const currentPlanName = user.subscription?.planName || "";
        const needsMigration =
          !currentPlanName ||
          currentPlanName === "Current Plan" ||
          currentPlanName === "No Plan" ||
          currentPlanName === "Starter" ||
          currentPlanName === "";

        if (needsMigration) {
          await updateSubscription(user.userId, {
            planName: "Starter Scalper",
            priceUSD: 50,
          });
          migratedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        errors.push(`Failed to migrate ${entry.userId}: ${(err as Error).message}`);
      }
    }

    return successResponse(
      {
        totalUsers: allUsers.length,
        migratedCount,
        skippedCount,
        errors,
      },
      `Migration complete: ${migratedCount} users assigned to Starter plan`,
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
