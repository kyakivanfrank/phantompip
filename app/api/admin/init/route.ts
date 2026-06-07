import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getUserIdByEmail, createUser, setUserByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";

export async function POST(_req: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "Mukisamicheal088@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD_PLAIN || "H7#xF!9t$mKQ2w5v";

    // Check if admin already exists
    const existingAdminId = await getUserIdByEmail(adminEmail);
    if (existingAdminId) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 }
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

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        adminId,
        email: adminEmail,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin init error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
