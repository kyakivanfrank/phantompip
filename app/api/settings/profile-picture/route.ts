export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAuth, clearSessionCookie } from "@/lib/server/auth";
import { getUser, updateUserProfilePicture } from "@/lib/server/db";
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
      await clearSessionCookie();
      return errorResponse("User account not found or deleted", 401);
    }

    const pictureNumber =
      typeof profilePicture === "number"
        ? profilePicture
        : parseInt(String(profilePicture).match(/\d+/)?.[0] || "1", 10);

    await updateUserProfilePicture(session.userId, pictureNumber);

    return successResponse({ profilePicture: pictureNumber }, "Profile picture updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
