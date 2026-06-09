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
const SESSION_SECRET = process.env.SESSION_SECRET || "phantompip-session-key-secure-prod-b8f4k9x2m7p1q3r5s8t0w2y4z6a8b9c1";

// Edge runtime has global crypto.subtle, Node.js 18+ also has global crypto.subtle
const subtle = (typeof crypto !== "undefined" && crypto.subtle)
  ? crypto.subtle
  : (require("crypto")).webcrypto.subtle;

async function signToken(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  const dataData = encoder.encode(data);

  const key = await subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await subtle.sign("HMAC", key, dataData);
  return Buffer.from(signature).toString("base64");
}

async function verifyToken(data: string, signature: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const dataData = encoder.encode(data);
    const sigData = Buffer.from(signature, "base64");

    const key = await subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return await subtle.verify("HMAC", key, sigData, dataData);
  } catch (e) {
    return false;
  }
}

export async function verifySessionToken(tokenValue: string): Promise<AuthSession | null> {
  try {
    const parts = tokenValue.split(".");
    if (parts.length !== 2) {
      return null;
    }

    const [base64Payload, signature] = parts;
    const isValid = await verifyToken(base64Payload, signature);
    if (!isValid) {
      console.warn("Invalid session token signature");
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(base64Payload, "base64").toString("utf-8")
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

export async function setSessionCookie(
  userId: string,
  email: string,
  isAdmin: boolean
): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_EXPIRY * 1000;

  // Create session token
  const sessionData = JSON.stringify({
    userId,
    email,
    isAdmin,
    expiresAt,
    timestamp: Date.now(),
  });

  const base64Payload = Buffer.from(sessionData).toString("base64");
  const signature = await signToken(base64Payload);
  const cookieValue = `${base64Payload}.${signature}`;

  // In production (Vercel), we omit the domain fallback to `.vercel.app` because browsers block cookies set on public suffixes.
  // Omitting domain makes it a host-only cookie.
  const cookieDomain = process.env.SESSION_COOKIE_DOMAIN || undefined;

  cookieStore.set("phantompip_session", cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: SESSION_EXPIRY,
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });
}

export async function getSessionCookie(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("phantompip_session");

  if (!sessionCookie?.value) {
    return null;
  }

  return await verifySessionToken(sessionCookie.value);
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
