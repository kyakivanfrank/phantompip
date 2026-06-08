import { NextRequest } from "next/server";
import { getUserIdByEmail, getUser } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/hashing";
import { isValidEmail, normalizeEmail } from "@/lib/server/validation";
import { setSessionCookie } from "@/lib/server/auth";
import { handleApiError, successResponse, errorResponse } from "@/lib/server/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const normalizedEmail = normalizeEmail(email || "");

    // Validate inputs
    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    if (!isValidEmail(normalizedEmail)) {
      return errorResponse("Invalid email format", 400);
    }

    // Get user ID by email
    const userId = await getUserIdByEmail(normalizedEmail);
    if (!userId) {
      return errorResponse("Invalid email or password", 401);
    }

    // Get user data
    const user = await getUser(userId as string);
    if (!user || !user.passwordHash) {
      return errorResponse("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      password,
      user.passwordHash as string
    );
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    // Set session cookie
    await setSessionCookie(
      userId as string,
      normalizedEmail,
      user.isAdmin === true || user.isAdmin === "true"
    );

    return successResponse(
      {
        user: {
          id: userId,
          email: user.email || normalizedEmail,
          fullName: user.fullName,
          isAdmin: user.isAdmin === true || user.isAdmin === "true",
          accountStatus: user.accountStatus,
        },
      },
      "Login successful",
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
