import { NextRequest, NextResponse } from "next/server";

// Visitor counter — free, no signup, no env vars needed.
// Primary: Abacus (abacus.jasoncameron.dev) — free keyless counting API, the maintained CountAPI replacement.
//   GET /hit/{ns}/{key} auto-creates + increments, GET /get/{ns}/{key} reads (404 if missing),
//   GET /create/{ns}/{key}?initializer=N seeds a fresh key. Limit: 30 req / 10s per egress IP.
// Fallback: Upstash Redis if env present, else in-memory (floored at SEED_COUNT so we never show below it).
const ABACUS_BASE = "https://abacus.jasoncameron.dev";
const ABACUS_NS = "adityahq.me";
const ABACUS_KEY = "visitors";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const REDIS_COUNT_KEY = "adityahq:visitors:count";

// In-memory fallback (per-instance) — seed to last known count so we never reset
const SEED_COUNT = 89;
const g = globalThis as unknown as {
  __VISITORS?: { count: number; seenIps: Set<string>; cachedGet: { value: number; at: number } | null };
};
if (!g.__VISITORS) g.__VISITORS = { count: SEED_COUNT, seenIps: new Set(), cachedGet: null };
if (g.__VISITORS.count < SEED_COUNT) g.__VISITORS.count = SEED_COUNT;

// Short cache for upstream GETs: many visitors poll every 10s behind shared Vercel egress IPs,
// and Abacus caps at 30 req / 10s per IP. 8s TTL keeps it live while staying far under the cap.
const GET_CACHE_TTL_MS = 8000;

type AbacusOk = { value: number };

async function abacusGet(): Promise<number | null> {
  try {
    const res = await fetch(`${ABACUS_BASE}/get/${ABACUS_NS}/${ABACUS_KEY}`, { cache: "no-store" });
    if (res.status === 404) return null; // key missing — needs seeding
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as AbacusOk | null;
    const v = data && typeof data.value === "number" ? data.value : NaN;
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

async function abacusHit(): Promise<number | null> {
  try {
    const res = await fetch(`${ABACUS_BASE}/hit/${ABACUS_NS}/${ABACUS_KEY}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as AbacusOk | null;
    const v = data && typeof data.value === "number" ? data.value : NaN;
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// Seed a missing key at SEED_COUNT. 201 = created, 409 = race (someone else created it) — both fine.
async function abacusSeedIfMissing(): Promise<void> {
  try {
    await fetch(`${ABACUS_BASE}/create/${ABACUS_NS}/${ABACUS_KEY}?initializer=${SEED_COUNT}`, {
      cache: "no-store",
    });
  } catch {
    // ignore — hit path will surface the real state
  }
}

function getIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return (req as unknown as { ip?: string }).ip || "unknown";
}

async function redisFetch(path: string): Promise<{ result?: unknown } | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}${path}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as { result?: unknown };
  } catch {
    return null;
  }
}

function memGet(): number {
  const store = g.__VISITORS!;
  if (store.count < SEED_COUNT) store.count = SEED_COUNT;
  return store.count;
}

function memHit(ip: string): number {
  const store = g.__VISITORS!;
  if (store.count < SEED_COUNT) store.count = SEED_COUNT;
  if (!store.seenIps.has(ip)) {
    store.seenIps.add(ip);
    store.count += 1;
  }
  return store.count;
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "get";
  const ip = getIp(request);

  // 1) Abacus (primary, persistent, free)
  if (action === "get") {
    const cached = g.__VISITORS!.cachedGet;
    if (cached && Date.now() - cached.at < GET_CACHE_TTL_MS) {
      return NextResponse.json({ value: cached.value });
    }
    let v = await abacusGet();
    if (v === null) {
      // Missing key (first ever run, or 6-month expiry) — reseed at last known count
      await abacusSeedIfMissing();
      v = await abacusGet();
    }
    if (v !== null) {
      const floored = Math.max(v, SEED_COUNT);
      g.__VISITORS!.cachedGet = { value: floored, at: Date.now() };
      return NextResponse.json({ value: floored });
    }
  } else {
    // hit: ensure key exists (seeded at 89), then increment
    let v = await abacusGet();
    if (v === null) {
      await abacusSeedIfMissing();
      v = await abacusGet();
    }
    if (v !== null) {
      const bumped = await abacusHit();
      const final = bumped !== null ? Math.max(bumped, SEED_COUNT + 1) : Math.max(v, SEED_COUNT);
      g.__VISITORS!.cachedGet = { value: final, at: Date.now() };
      return NextResponse.json({ value: final });
    }
  }

  // 2) Upstash Redis (only if env configured)
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const cur = await redisFetch(`/get/${REDIS_COUNT_KEY}`);
      const curVal = cur?.result != null ? Number(cur.result) : NaN;
      if (!Number.isFinite(curVal) || curVal < SEED_COUNT) {
        await redisFetch(`/set/${REDIS_COUNT_KEY}/${SEED_COUNT}`);
      }
      if (action === "hit") await redisFetch(`/incr/${REDIS_COUNT_KEY}`);
      const get = await redisFetch(`/get/${REDIS_COUNT_KEY}`);
      const val = get?.result != null ? Number(get.result) : NaN;
      if (Number.isFinite(val)) return NextResponse.json({ value: Math.max(val, SEED_COUNT) });
    } catch {
      // fall through to memory
    }
  }

  // 3) In-memory fallback (per-instance, floored — never below last known count)
  return NextResponse.json({ value: action === "hit" ? memHit(ip) : memGet() });
}

