// Simple sliding-window limiter. Uses Upstash Redis if env present, else in-memory Map (dev / simple mode).
type Entry = number[]; // timestamps ms

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 25;

const memStore = new Map<string, Entry>();

function memCheck(key: string): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const arr = memStore.get(key) ?? [];
  const fresh = arr.filter((t) => now - t < WINDOW_MS);
  if (fresh.length >= MAX_REQUESTS) {
    memStore.set(key, fresh);
    const oldest = fresh[0] ?? now;
    return { allowed: false, remaining: 0, resetMs: oldest + WINDOW_MS - now };
  }
  fresh.push(now);
  memStore.set(key, fresh);
  return { allowed: true, remaining: MAX_REQUESTS - fresh.length, resetMs: 0 };
}

export async function checkRateLimit(
  key: string
): Promise<{ allowed: boolean; remaining: number; resetMs: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return memCheck(key);
  }
  try {
    const now = Date.now();
    const bucket = Math.floor(now / WINDOW_MS).toString();
    const redisKey = `chat:${key}:${bucket}`;
    const res = await fetch(`${url}/eval/0`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["local c=redis.call('INCR',KEYS[1]); if c==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return c", 1, redisKey, String(WINDOW_MS)]),
      cache: "no-store",
    });
    if (!res.ok) return memCheck(key);
    const data = (await res.json()) as { result?: number };
    const count = typeof data.result === "number" ? data.result : 0;
    if (count > MAX_REQUESTS) return { allowed: false, remaining: 0, resetMs: WINDOW_MS };
    return { allowed: true, remaining: MAX_REQUESTS - count, resetMs: 0 };
  } catch {
    return memCheck(key);
  }
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
