import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Real API endpoints. Anything else under /api/* is rewritten to a hidden
// page that calls notFound(), so unknown API URLs render the custom 404
// page (same as unknown site paths) instead of a bare framework 404.
// NOTE: add future API routes to this list.
const KNOWN_API_PATHS = new Set(["/api/ai", "/api/visitors", "/api/github", "/api/private"]);

// Numeric C-program source endpoints: /api/1 … /api/6 (see src/lib/c-programs.ts).
// Regex instead of a set so the bundle doesn't pull the program sources in here.
const KNOWN_API_PATTERN = /^\/api\/(?:[1-6])$/;

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.replace(/\/+$/, "") || "/api";
  if (KNOWN_API_PATHS.has(path) || KNOWN_API_PATTERN.test(path)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/api-404", request.url));
}

export const config = {
  matcher: "/api/:path*",
};
