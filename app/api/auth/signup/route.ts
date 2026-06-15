export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createUser, getUserIdByEmail } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/hashing";
import {
  isValidEmail,
  isValidPassword,
  sanitizeInput,
  normalizeEmail,
} from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";
import { UserDocument } from "@/lib/types";

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

    // Create user document according to RedisJSON schema
    const userId = "usr_" + randomUUID().substring(0, 8);
    const nowIso = new Date().toISOString();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    const newUser: UserDocument = {
      userId,
      isAdmin: false,
      account: {
        username: sanitizeInput(fullName),
        email: normalizedEmail,
        passwordHash,
        createdAt: nowIso,
        lastLoginAt: nowIso,
      },
      subscription: {
        status: "pending",
        approvalStatus: "pending",
        planName: "Current Plan",
        priceUSD: 0,
        billingCycle: "monthly",
        startDate: todayStr,
        expiryDate: thirtyDaysLater,
        approvedAt: null,
        payments: [],
      },
      mt5: null,
      bots: {},
    };

    await createUser(userId, newUser);

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
