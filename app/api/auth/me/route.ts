import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { getUser } from "@/lib/server/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await requireAuth();
    let user;
    try {
      user = await getUser(session.userId);
    } catch (error) {
      console.error("Auth me DB error:", error);
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
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
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
