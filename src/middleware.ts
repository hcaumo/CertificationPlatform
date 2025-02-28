import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of paths that don't require authentication
const publicPaths = [
  "/auth/signin",
  "/auth/verify-request",
  "/auth/error",
  "/api/auth"
];

// Checks if a path matches any of the public paths
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => {
    return path === publicPath || path.startsWith(publicPath + "/");
  }) || path.startsWith("/_next") || path.includes("/favicon.ico");
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Add headers for CSRF protection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-hostname", request.nextUrl.hostname);
  
  // Check for session token in cookies to determine if logged in
  // This is a simple check - the actual auth validation happens at the page level
  const hasSessionToken = request.cookies.has("next-auth.session-token") || 
                          request.cookies.has("__Secure-next-auth.session-token");
  
  // Redirect to login if accessing protected route without session token
  if (!isPublicPath(path) && !hasSessionToken) {
    const url = new URL("/auth/signin", request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Export the config to limit where middleware runs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};