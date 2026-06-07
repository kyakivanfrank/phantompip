import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAllUsers } from "@/lib/server/db";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
    const users = await getAllUsers();

    // Filter out admin user and format data
    const formattedUsers = (users as any[])
      .filter((u) => !(u.isAdmin === true || u.isAdmin === "true"))
      .map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        accountStatus: u.accountStatus,
        subscriptionExpiresAt: u.subscriptionExpiresAt,
        createdAt: u.createdAt,
        mt5Connected: u.mt5Connected === true || u.mt5Connected === "true",
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (u.subscriptionExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)
          )
        ),
      }));

    return NextResponse.json(
      {
        users: formattedUsers,
        totalUsers: formattedUsers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
