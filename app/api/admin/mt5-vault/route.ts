export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser } from "@/lib/server/db"; // Removed getMt5Credentials
import { handleApiError, successResponse } from "@/lib/server/api-response";

// Helper function to check if credentials have actual user input
function hasCredentials(mt5: any): boolean {
  return !!(mt5?.loginId?.trim() && mt5?.password?.trim() && mt5?.brokerServer?.trim());
}

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const users = await getAllUsers();

    const users_data: any[] = [];

    for (const user of users) {
      // 1. Skip admins
      if (user.isAdmin) continue;

      // 2. Filter out non-approved users based on index structure
      if (user.approvalStatus !== "approved") continue;

      // 3. Fetch the full user document. This ALREADY contains the full nested mt5 object!
      const fullUser = await getUser(user.userId);
      if (!fullUser) continue;

      // 4. THE FIX: Grab the MT5 credentials directly from the user document we just fetched
      const creds = fullUser.mt5;
      
      // 5. Calculate remaining subscription days using correct nesting
      const expiryMs = new Date(user.expiryDate || "2099-01-01").getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000))
      );

      // 6. Build base user object
      const base = {
        userId: user.userId,
        userEmail: user.email,
        userFullName: user.username,
        subscriptionExpiresAt: expiryMs,
        daysRemaining,
        subscriptionStatus: user.subscriptionStatus,
      };

      // 7. Check if credentials contain actual data
      if (creds && hasCredentials(creds)) {
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

    // 8. Calculate final stats
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