import { NextRequest, NextResponse } from "next/server";

// Visitor counter — no external countapi (both xyz and mileshilliard are now behind Cloudflare JS challenge).
// Uses Upstash Redis if env present, else in-memory global (persists for instance lifetime).
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const COUNT_KEY = "adityahq:visitors:count";
const IPS_KEY = "adityahq:visitors:ips";

// In-memory fallback (global persists across HMR) — seed to last known count so we never reset
const SEED_COUNT = 89;
const g = globalThis as unknown as { __VISITORS?: { count: number; ips: Set<string> } };
if (!g.__VISITORS) g.__VISITORS = { count: SEED_COUNT, ips: new Set() };
if (g.__VISITORS.count < SEED_COUNT) g.__VISITORS.count = SEED_COUNT;

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  // @ts-ignore - nextjs ip
  return (req as unknown as { ip?: string }).ip || "unknown";
}

async function redisFetch(path: string, body?: unknown) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { result?: unknown };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "get";
  const ip = getIp(request);

  // Try Redis if configured
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      // Ensure seeded if empty
      const cur = await redisFetch(`/get/${COUNT_KEY}`);
      const curVal = cur?.result != null ? Number(cur.result) : null;
      if (curVal === null || !Number.isFinite(curVal) || curVal < SEED_COUNT) {
        await redisFetch(`/set/${COUNT_KEY}/${SEED_COUNT}`);
      }
      if (action === "hit") {
        const sadd = await redisFetch(`/sadd/${IPS_KEY}/${encodeURIComponent(ip)}`);
        const isNew = sadd?.result === 1;
        if (isNew) {
          await redisFetch(`/incr/${COUNT_KEY}`);
        }
        const get = await redisFetch(`/get/${COUNT_KEY}`);
        const val = get?.result != null ? Number(get.result) : SEED_COUNT;
        return NextResponse.json({ value: Number.isFinite(val) ? val : SEED_COUNT });
      } else {
        const get = await redisFetch(`/get/${COUNT_KEY}`);
        const val = get?.result != null ? Number(get.result) : SEED_COUNT;
        return NextResponse.json({ value: Number.isFinite(val) ? val : SEED_COUNT });
      }
    } catch {
      // fall through to memory
    }
  }

  // In-memory fallback — resume from SEED_COUNT
  const store = g.__VISITORS!;
  if (store.count < SEED_COUNT) store.count = SEED_COUNT;
  if (action === "hit") {
    if (!store.ips.has(ip)) {
      store.ips.add(ip);
      store.count += 1;
    }
    return NextResponse.json({ value: store.count });
  }
  return NextResponse.json({ value: store.count });
}
