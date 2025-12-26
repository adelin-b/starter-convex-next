import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/api/webhooks",
  "/api/auth",
  "/_next",
  "/favicon.ico",
] as const;

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/profile", "/api/protected"] as const;

// Regex for matching static asset file extensions
const STATIC_ASSET_REGEX = /\.(svg|png|jpg|jpeg|gif|webp|ico)$/;

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets
  if (pathname.match(STATIC_ASSET_REGEX)) {
    return NextResponse.next();
  }

  // Check for session cookie
  let isAuthenticated = false;
  try {
    const sessionCookie = getSessionCookie(request);
    isAuthenticated = !!sessionCookie;
  } catch (error) {
    console.error("Error checking session cookie:", error);
  }

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Redirect unauthenticated users from protected routes to sign-in
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
