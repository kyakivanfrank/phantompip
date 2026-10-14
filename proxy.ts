import { NextRequest, NextResponse } from "next/server";
import type { NextMiddleware } from "next/server";
import { verifySessionToken } from "./lib/server/auth";
import { getUser } from "./lib/server/db";

export const proxy: NextMiddleware = async (request: NextRequest) => {
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
    // If user has a session cookie on login/signup, check validity
    if ((pathname === "/login" || pathname === "/signup") && sessionCookie?.value) {
      const decoded = await verifySessionToken(sessionCookie.value);
      if (decoded && decoded.expiresAt > Date.now()) {
        const user = await getUser(decoded.userId);
        if (!user) {
          // User was deleted! Clear dead session cookie and allow login/signup page to load
          const response = NextResponse.next();
          response.cookies.delete("phantompip_session");
          return response;
        }
        return NextResponse.redirect(
          decoded.isAdmin ? new URL("/admin", request.url) : new URL("/dashboard", request.url)
        );
      }
    }
    return NextResponse.next();
  }

  // Check if route requires user authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = await verifySessionToken(sessionCookie.value);
    if (!decoded || decoded.expiresAt < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("phantompip_session");
      return response;
    }

    // Check if user still exists in database
    const user = await getUser(decoded.userId);
    if (!user) {
      // User was deleted! Invalidate session cookie and redirect to login
      const response = NextResponse.redirect(new URL("/login?deleted=true", request.url));
      response.cookies.delete("phantompip_session");
      return response;
    }

    // If admin tries to access user dashboard, redirect to admin
    if (decoded.isAdmin && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (!decoded.isAdmin) {
      const isActivated = user?.subscription?.status === 'active';
      
      if (!isActivated && pathname !== "/dashboard/activate") {
        return NextResponse.redirect(new URL("/dashboard/activate", request.url));
      }
      
      if (isActivated && pathname === "/dashboard/activate") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Check if route requires admin authentication
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const decoded = await verifySessionToken(sessionCookie.value);
    if (!decoded || decoded.expiresAt < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("phantompip_session");
      return response;
    }

    const user = await getUser(decoded.userId);
    if (!user || !user.isAdmin) {
      const response = NextResponse.redirect(new URL("/login?deleted=true", request.url));
      response.cookies.delete("phantompip_session");
      return response;
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
