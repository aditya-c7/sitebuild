import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Real API endpoints. Anything else under /api/* is rewritten to a hidden
// page that calls notFound(), so unknown API URLs render the custom 404
// page (same as unknown site paths) instead of a bare framework 404.
// NOTE: add future API routes to this list.
const KNOWN_API_PATHS = new Set(["/api/ai", "/api/visitors", "/api/github", "/api/private"]);

// Numeric C-program source endpoints: /api/1 … /api/6 (see src/lib/c-programs.ts).
// Regex instead of a set so the bundle doesn't pull the program sources in here.
const KNOWN_API_PATTERN = /^\/api\/(?:[1-6])$/;

// Route protection lives in each page/handler via `await auth.protect()` —
// clerkMiddleware stays bare. This handler only preserves the pre-Clerk
// /api/* guard above.
export default clerkMiddleware((auth, request) => {
  const pathname = request.nextUrl.pathname;
  if (pathname !== "/api" && !pathname.startsWith("/api/")) return;
  const path = pathname.replace(/\/+$/, "") || "/api";
  if (KNOWN_API_PATHS.has(path) || KNOWN_API_PATTERN.test(path)) return;
  return NextResponse.rewrite(new URL("/api-404", request.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
