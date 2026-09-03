import { NextRequest, NextResponse } from "next/server";

// Server proxy for the visitor counter (avoids CORS/adblock issues).
// Uses countapi.mileshilliard.com (free, no key). countapi.xyz is dead.
const API_BASE = "https://countapi.mileshilliard.com/api/v1";
const KEY = "adityahq-visitors";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "get";

  const url =
    action === "hit" ? `${API_BASE}/hit/${KEY}` : `${API_BASE}/get/${KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return NextResponse.json({ value: null, error: "counter unavailable" }, { status: 500 });
  }
}
