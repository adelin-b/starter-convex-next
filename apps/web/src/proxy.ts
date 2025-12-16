import { captureException } from "@sentry/nextjs";
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { getSafeCallbackUrl } from "@/utils/url-utils";

// Routes that require authentication
const protectedRoutes = ["/", "/vehicles", "/admin"] as const;

// Routes that should redirect to vehicles if already authenticated
const authRoutes = ["/login"] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie with error handling
  // If cookie parsing fails, treat as unauthenticated (user will be redirected to login)
  let isAuthenticated = false;
  try {
    const sessionCookie = getSessionCookie(request);
    isAuthenticated = !!sessionCookie;
  } catch (error) {
    // Track in Sentry - corrupted cookies cause redirect loops
    captureException(error, {
      tags: { feature: "auth", location: "proxy" },
      extra: { pathname },
    });
  }

  // Check if the current path matches protected routes
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to vehicles
  if (isAuthRoute && isAuthenticated) {
    const rawCallbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const callbackUrl = getSafeCallbackUrl(rawCallbackUrl);
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
