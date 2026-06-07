import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createUser, setUserByEmail, getUserIdByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import {
  isValidEmail,
  isValidPassword,
  sanitizeInput,
} from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, confirmPassword, fullName } = body;

    // Validate inputs
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !fullName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserId = await getUserIdByEmail(email);
    if (existingUserId) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = randomUUID();
    const now = Date.now();
    const subscriptionExpiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days trial

    await createUser(userId, {
      email,
      passwordHash,
      fullName: sanitizeInput(fullName),
      accountStatus: "Pending Approval",
      subscriptionExpiresAt,
      createdAt: now,
      isAdmin: false,
      mt5Connected: false,
    });

    // Map email to userId
    await setUserByEmail(email, userId);

    // Set session cookie
    await setSessionCookie(userId, email, false);

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: userId,
          email,
          fullName,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
