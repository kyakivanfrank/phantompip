import { cookies } from "next/headers";
import { AuthSession } from "./types";

// Session configuration
const SESSION_EXPIRY_STR = process.env.SESSION_EXPIRY || "86400";
const SESSION_EXPIRY = (() => {
  const parsed = parseInt(SESSION_EXPIRY_STR, 10);
  if (isNaN(parsed) || parsed <= 0) {
    console.warn(
      `Invalid SESSION_EXPIRY value: ${SESSION_EXPIRY_STR}, using default 86400 (24 hours)`
    );
    return 86400;
  }
  return parsed;
})();

export async function setSessionCookie(
  userId: string,
  email: string,
  isAdmin: boolean
): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_EXPIRY * 1000;

  // Create session token (in production, use JWT)
  const sessionData = JSON.stringify({
    userId,
    email,
    isAdmin,
    expiresAt,
    timestamp: Date.now(),
  });

  const encodedSession = Buffer.from(sessionData).toString("base64");

  cookieStore.set("phantompip_session", encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_EXPIRY,
    path: "/",
    ...(process.env.SESSION_COOKIE_DOMAIN
      ? { domain: process.env.SESSION_COOKIE_DOMAIN }
      : {}),
  });
}

export async function getSessionCookie(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("phantompip_session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString("utf-8")
    );

    // Validate decoded session has required fields
    if (
      !decoded.userId ||
      !decoded.email ||
      typeof decoded.isAdmin !== "boolean"
    ) {
      console.warn("Invalid session data structure");
      return null;
    }

    // Check if session is expired
    if (decoded.expiresAt < Date.now()) {
      return null;
    }

    return decoded as AuthSession;
  } catch (error) {
    console.error("Failed to decode session:", error);
    return null;
  }
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("phantompip_session");
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSessionCookie();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (!session.isAdmin) {
    throw new Error("Forbidden");
  }
  return session;
}
