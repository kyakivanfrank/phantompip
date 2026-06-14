export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getUserIdByEmail, createUser, setUserByEmail, resetUserPassword } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import { normalizeEmail } from "@/lib/server/validation";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { UserDocument } from "@/lib/types";

export async function POST(_req: NextRequest) {
  try {
    // Prevent accidental public creation of an admin account.
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
      await resetUserPassword(existingAdminId, passwordHash);

      return successResponse(
        { adminId: existingAdminId },
        "Admin user password updated successfully to match current environment configuration",
        200
      );
    }

    // Create admin user
    const adminId = "usr_" + randomUUID().substring(0, 8);
    const nowIso = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];

    const adminUser: UserDocument = {
      userId: adminId,
      isAdmin: true,
      account: {
        username: "Admin",
        email: adminEmail,
        passwordHash,
        createdAt: nowIso,
        lastLoginAt: nowIso,
      },
      subscription: {
        status: "active",
        approvalStatus: "approved",
        planName: "Starter Plan",
        priceUSD: 0,
        billingCycle: "lifetime",
        startDate: todayStr,
        expiryDate: "2099-01-01",
        approvedAt: nowIso,
        payments: [],
      },
      mt5: null,
      bots: {},
    };

    await createUser(adminId, adminUser);
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
