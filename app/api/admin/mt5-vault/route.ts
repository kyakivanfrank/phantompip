export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser, mapWithConcurrency } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

// Helper function to check if credentials have actual user input
function hasCredentials(mt5: any): boolean {
  return !!(mt5?.loginId?.trim() && mt5?.password?.trim() && mt5?.brokerServer?.trim());
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '', 10);
    const users = await getAllUsers();
    const relevantUsers = users.filter((user) => !user.isAdmin && user.approvalStatus === 'approved');
    const limitedUsers = Number.isFinite(limit) && limit > 0 ? relevantUsers.slice(0, limit) : relevantUsers;

    const users_data = (await mapWithConcurrency(limitedUsers, async (user) => {
      const fullUser = await getUser(user.userId);
      if (!fullUser) return null;

      const creds = fullUser.mt5;
      const expiryMs = new Date(user.expiryDate || "2099-01-01").getTime();
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

      if (creds && hasCredentials(creds)) {
        return {
          ...base,
          mt5LoginId: creds.loginId,
          mt5Password: creds.password,
          brokerServer: creds.brokerServer,
          hasCredentials: true,
          connectedAt: creds.connectedAt ? new Date(creds.connectedAt).getTime() : null,
        };
      }

      return {
        ...base,
        hasCredentials: false,
      };
    }, 12)).filter(Boolean);

    const totalWithCredentials = users_data.filter((u: any) => u.hasCredentials).length;
    const totalWithout = users_data.filter((u: any) => !u.hasCredentials).length;

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