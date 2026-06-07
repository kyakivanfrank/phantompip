import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";

export async function POST(_req: NextRequest) {
  try {
    await clearSessionCookie();

    return NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
