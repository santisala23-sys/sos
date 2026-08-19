/**
 * Rate limiting in-memory para Middleware (Edge).
 * Cada instancia tiene su propio Map; suficiente para MVP anti-bot.
 */

export type EdgeRateLimitPreset = "public" | "contact";

const PRESETS: Record<
  EdgeRateLimitPreset,
  { limit: number; windowMs: number }
> = {
  public: { limit: 30, windowMs: 60_000 },
  contact: { limit: 10, windowMs: 60_000 },
};

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

function pruneBuckets(now: number): void {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > 120_000) {
      buckets.delete(key);
    }
    if (buckets.size <= MAX_BUCKETS * 0.8) break;
  }
}

export function getEdgeClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}

export type EdgeRateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

export function checkEdgeRateLimit(
  ip: string,
  preset: EdgeRateLimitPreset,
  suffix?: string,
): EdgeRateLimitResult {
  const { limit, windowMs } = PRESETS[preset];
  const key = `${preset}:${ip}${suffix ? `:${suffix}` : ""}`;
  const now = Date.now();

  pruneBuckets(now);

  let bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    const retryAfterSec = Math.ceil(
      (bucket.windowStart + windowMs - now) / 1000,
    );
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  return { allowed: true };
}

export function edgeRateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({ error: "Demasiadas solicitudes. Intentá más tarde." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
