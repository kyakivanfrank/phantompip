export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getUserIdByEmail, createUser, setUserByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import { normalizeEmail } from "@/lib/server/validation";
import { handleApiError, successResponse } from "@/lib/server/api-response";

export async function POST(_req: NextRequest) {
  try {
    const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "Mukisamicheal088@gmail.com");
    const adminPassword = process.env.ADMIN_PASSWORD_PLAIN || "H7#xF!9t$mKQ2w5v";

    // Check if admin already exists
    const existingAdminId = await getUserIdByEmail(adminEmail);
    if (existingAdminId) {
      return successResponse(
        { adminId: existingAdminId },
        "Admin user already exists",
        200
      );
    }

    // Hash admin password
    const passwordHash = await hashPassword(adminPassword);

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
