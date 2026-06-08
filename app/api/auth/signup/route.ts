import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createUser, setUserByEmail, getUserIdByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import {
  isValidEmail,
  isValidPassword,
  sanitizeInput,
  normalizeEmail,
} from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, confirmPassword, fullName } = body;
    const normalizedEmail = normalizeEmail(email || "");

    // Validate inputs
    if (!email || !password || !confirmPassword || !fullName) {
      return errorResponse("Missing required fields", 400);
    }

    if (!isValidEmail(normalizedEmail)) {
      return errorResponse("Invalid email format", 400);
    }

    if (!isValidPassword(password)) {
      return errorResponse(
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        400
      );
    }

    if (password !== confirmPassword) {
      return errorResponse("Passwords do not match", 400);
    }

    // Check if user already exists
    const existingUserId = await getUserIdByEmail(normalizedEmail);
    if (existingUserId) {
      return errorResponse("User already exists", 409);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = randomUUID();
    const now = Date.now();
    const subscriptionExpiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days trial

    await createUser(userId, {
      email: normalizedEmail,
      passwordHash,
      fullName: sanitizeInput(fullName),
      accountStatus: "Pending Approval",
      subscriptionExpiresAt,
      createdAt: now,
      isAdmin: false,
      mt5Connected: false,
    });

    // Map email to userId
    await setUserByEmail(normalizedEmail, userId);

    // Set session cookie
    await setSessionCookie(userId, normalizedEmail, false);

    return successResponse(
      {
        user: {
          id: userId,
          email: normalizedEmail,
          fullName,
        },
      },
      "Signup successful",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
