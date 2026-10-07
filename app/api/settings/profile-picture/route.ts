export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser, primaryDb } from "@/lib/server/db";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { profilePicture } = body;

    if (!profilePicture) {
      return errorResponse("Profile picture is required", 400);
    }

    const user = await getUser(session.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (!primaryDb) {
      return errorResponse("Database connection failed", 500);
    }

    user.account.profilePicture = profilePicture;
    await primaryDb.set(`user:${session.userId}`, JSON.stringify(user));

    return successResponse({ profilePicture }, "Profile picture updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
