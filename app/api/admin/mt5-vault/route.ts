export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser, getMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

// Helper function to check if credentials are valid
function hasCredentials(mt5: any): boolean {
  return !!(mt5?.loginId?.trim() && mt5?.password?.trim() && mt5?.brokerServer?.trim());
}

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const users = await getAllUsers();

    const users_data: any[] = [];

    for (const user of users) {
      if (user.isAdmin) continue;

      // Only show users with approved/active subscriptions
      if (user.approvalStatus !== "approved") continue;

      const fullUser = await getUser(user.userId);
      if (!fullUser) continue;

      const creds = await getMt5Credentials(user.userId);
      const expiryMs = new Date(user.expiryDate).getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000))
      );

      const base = {
        userId: user.userId,
        userEmail: user.email,
        userFullName: user.username,
        subscriptionExpiresAt: expiryMs,
        daysRemaining,
        subscriptionStatus: user.subscriptionStatus,
      };

      const hasCredsFlag = hasCredentials(creds);

      if (hasCredsFlag) {
        users_data.push({
          ...base,
          mt5LoginId: creds.loginId,
          mt5Password: creds.password,
          brokerServer: creds.brokerServer,
          hasCredentials: true,
          connectedAt: creds.connectedAt ? new Date(creds.connectedAt).getTime() : null,
        });
      } else {
        users_data.push({
          ...base,
          hasCredentials: false,
        });
      }
    }

    const totalWithCredentials = users_data.filter(u => u.hasCredentials).length;
    const totalWithout = users_data.filter(u => !u.hasCredentials).length;

    return successResponse(
      {
        users: users_data,
        totalWithCredentials,
        totalWithout,
      },
      "MT5 vault retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
