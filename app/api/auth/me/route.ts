export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    const user = await getUser(session.userId);

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(
      {
        user: {
          id: session.userId,
          email: user.account.email,
          username: user.account.username,
          isAdmin: session.isAdmin,
          accountStatus: user.subscription.status,
          subscriptionExpiresAt: new Date(user.subscription.expiryDate).getTime(),
          createdAt: new Date(user.account.createdAt).getTime(),
          mt5Connected: user.mt5?.isConnected ?? false,
        },
      },
      "User profile retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
