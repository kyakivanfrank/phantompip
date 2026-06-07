import { NextRequest, NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get("phantompip_session");

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];

  // Admin routes that require admin authentication
  const adminRoutes = ["/admin"];

  // Dashboard routes that require user authentication
  const protectedRoutes = ["/dashboard"];

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in, redirect from login/signup
    if ((pathname === "/login" || pathname === "/signup") && sessionCookie?.value) {
      try {
        const decoded = JSON.parse(
          Buffer.from(sessionCookie.value, "base64").toString("utf-8")
        );
        if (decoded.expiresAt > Date.now()) {
          return NextResponse.redirect(
            decoded.isAdmin ? new URL("/admin", request.url) : new URL("/dashboard", request.url)
          );
        }
      } catch (e) {
        // Invalid session, continue
      }
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString("utf-8")
      );

      // Check session expiry
      if (decoded.expiresAt < Date.now()) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // If admin tries to access user dashboard, redirect to admin
      if (decoded.isAdmin && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Check if route requires admin authentication
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString("utf-8")
      );

      // Check session expiry
      if (decoded.expiresAt < Date.now()) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check admin status
      if (!decoded.isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
