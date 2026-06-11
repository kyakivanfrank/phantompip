export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getMt5Credentials } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const users = await getAllUsers();

    // Get only active users with MT5 connected
    const mt5Vault = [];

    for (const user of users) {
      // Skip admin users
      if (user.isAdmin) {
        continue;
      }

      // Only show active subscriptions
      if (user.subscriptionStatus !== "active") {
        continue;
      }

      const creds = await getMt5Credentials(user.userId);
      if (!creds || !creds.isConnected) {
        continue;
      }

      const expiryMs = new Date(user.expiryDate).getTime();

      mt5Vault.push({
        userId: user.userId,
        userEmail: user.email,
        userFullName: user.username,
        subscriptionExpiresAt: expiryMs,
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (expiryMs - Date.now()) / (24 * 60 * 60 * 1000)
          )
        ),
        mt5LoginId: creds.loginId,
        mt5Password: creds.password, // Plain text intentional
        brokerServer: creds.brokerServer,
        connectionStatus: creds.isConnected ? "Connected" : "Disconnected",
        connectedAt: creds.connectedAt ? new Date(creds.connectedAt).getTime() : null,
      });
    }

    return successResponse(
      {
        mt5Vault,
        totalActive: mt5Vault.length,
      },
      "MT5 vault retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
