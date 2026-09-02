import { NextRequest, NextResponse } from "next/server";

// Best for Vercel/Next.js hosting - no PHP needed, uses countapi.xyz as free backend
// This route is optional - the client components call countapi directly.
// Keep this as fallback if you want server-side counting.

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "get";
  const namespace = "adityahq";
  const key = "visitors";

  const url =
    action === "hit"
      ? `https://api.countapi.xyz/hit/${namespace}/${key}`
      : `https://api.countapi.xyz/get/${namespace}/${key}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json({ value: null, error: "countapi unavailable" }, { status: 500 });
  }
}
