import { NextRequest, NextResponse } from "next/server";
import { getUserIdByEmail, getUser } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/hashing";
import { isValidEmail, normalizeEmail } from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const normalizedEmail = normalizeEmail(email || "");

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get user ID by email
    let userId;
    try {
      userId = await getUserIdByEmail(normalizedEmail);
    } catch (err) {
      console.error("Redis error while fetching userId:", err);
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user data
    let user;
    try {
      user = await getUser(userId as string);
    } catch (err) {
      console.error("Redis error while fetching user data:", err);
      return NextResponse.json(
        { error: "Authentication service unavailable" },
        { status: 503 }
      );
    }
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      user.passwordHash as string
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session cookie
    await setSessionCookie(
      userId as string,
      normalizedEmail,
      user.isAdmin === true || user.isAdmin === "true"
    );

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: userId,
          email: user.email || normalizedEmail,
          fullName: user.fullName,
          isAdmin: user.isAdmin === true || user.isAdmin === "true",
          accountStatus: user.accountStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
