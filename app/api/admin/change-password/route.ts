export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getUser, resetUserPassword } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/hashing";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
    const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse("All password fields are required", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse("New password must be at least 8 characters long", 400);
    }

    if (newPassword !== confirmPassword) {
      return errorResponse("New password confirmation does not match", 400);
    }

    const session = await requireAdmin();
    const user = await getUser(session.userId);

    if (!user?.account?.passwordHash) {
      return errorResponse("Admin account not found", 404);
    }

    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.account.passwordHash);
    if (!isCurrentPasswordValid) {
      return errorResponse("Current password is incorrect", 401);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await resetUserPassword(session.userId, newPasswordHash);

    return successResponse(
      { success: true },
      "Admin password updated successfully",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
