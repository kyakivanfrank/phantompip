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
          email: user.email,
          fullName: user.fullName,
          isAdmin: session.isAdmin,
          accountStatus: user.accountStatus,
          subscriptionExpiresAt: user.subscriptionExpiresAt,
          createdAt: user.createdAt,
          mt5Connected: user.mt5Connected === true || user.mt5Connected === "true",
        },
      },
      "User profile retrieved",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
