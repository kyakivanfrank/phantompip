import { NextRequest, NextResponse } from "next/server";
import { getUserIdByEmail, getUser } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/hashing";
import { isValidEmail } from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get user ID by email
    const userId = await getUserIdByEmail(email);
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await getUser(userId as string);
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
      email,
      user.isAdmin === true || user.isAdmin === "true"
    );

    return NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: userId,
          email: user.email,
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
