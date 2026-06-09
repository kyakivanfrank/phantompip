export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getUserIdByEmail, createUser, setUserByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import { normalizeEmail } from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(_req: NextRequest) {
  try {
    // Prevent accidental public creation of an admin account.
    // This endpoint only runs when ENABLE_ADMIN_INIT is explicitly set to "true".
    // Intentionally default to disabled to require manual DB changes for admin creation.
    if (process.env.ENABLE_ADMIN_INIT !== "true") {
      return errorResponse("Admin initialization is disabled on this deployment", 403);
    }
    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "Mukisamicheal088@gmail.com");
    const adminPassword = process.env.ADMIN_PASSWORD_PLAIN || "H7#xF!9t$mKQ2w5v";

    const passwordHash = await hashPassword(adminPassword);

    // Check if admin already exists
    const existingAdminId = await getUserIdByEmail(adminEmail);
    if (existingAdminId) {
      // Update existing admin password to match current env configuration
      await createUser(existingAdminId, {
        passwordHash,
      });

      return successResponse(
        { adminId: existingAdminId },
        "Admin user password updated successfully to match current environment configuration",
        200
      );
    }

    // Create admin user
    const adminId = randomUUID();
    const now = Date.now();

    await createUser(adminId, {
      email: adminEmail,
      passwordHash,
      fullName: "Platform Administrator",
      accountStatus: "Active",
      subscriptionExpiresAt: now + 365 * 24 * 60 * 60 * 1000, // 1 year
      createdAt: now,
      isAdmin: true,
      mt5Connected: false,
    });

    // Map email to admin ID
    await setUserByEmail(adminEmail, adminId);

    return successResponse(
      {
        adminId,
        email: adminEmail,
      },
      "Admin user created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
