import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// First, create a basic middleware to add custom headers
export function middleware(request: NextRequest) {
  // Add headers for CSRF protection
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-hostname", request.nextUrl.hostname);
  
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
     * - api/auth (auth API routes that don't need this middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};