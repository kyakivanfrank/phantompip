export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers, getUser } from "@/lib/server/db";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const index = await getAllUsers();
    
    const userPromises = index
      .filter(u => !u.isAdmin)
      .map(u => getUser(u.userId));
      
    const fullUsers = await Promise.all(userPromises);

    // Format data
    const formattedUsers = fullUsers
      .filter((u): u is NonNullable<typeof u> => u !== null)
      .map((u) => {
        const expiresAt = new Date(u.subscription.expiryDate).getTime();
        return {
          id: u.userId,
          email: u.account.email,
          fullName: u.account.username,
          accountStatus: u.subscription.status,
          subscriptionExpiresAt: expiresAt,
          createdAt: new Date(u.account.createdAt).getTime(),
          mt5Connected: u.mt5?.isConnected ?? false,
          daysRemaining: Math.max(
            0,
            Math.ceil(
              (expiresAt - Date.now()) / (24 * 60 * 60 * 1000)
            )
          ),
        };
      });

    return successResponse(
      {
        users: formattedUsers,
        totalUsers: formattedUsers.length,
      },
      "Users retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
