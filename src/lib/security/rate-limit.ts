import { getSql } from "@/lib/db/index";

export type RateLimitPreset =
  | "auth"
  | "alerts"
  | "messages"
  | "api"
  | "admin";

const PRESETS: Record<
  RateLimitPreset,
  { limit: number; windowMs: number }
> = {
  auth: { limit: 10, windowMs: 15 * 60 * 1000 },
  alerts: { limit: 20, windowMs: 60 * 60 * 1000 },
  messages: { limit: 60, windowMs: 60 * 60 * 1000 },
  api: { limit: 120, windowMs: 60 * 1000 },
  admin: { limit: 200, windowMs: 60 * 1000 },
};

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSec: number };

export async function checkRateLimit(
  bucketKey: string,
  preset: RateLimitPreset,
): Promise<RateLimitResult> {
  const { limit, windowMs } = PRESETS[preset];
  const sql = getSql();
  const windowStart = new Date(Date.now() - windowMs);

  const rows = await sql`
  WITH upsert AS (
    INSERT INTO rate_limit_buckets (bucket_key, request_count, window_start)
    VALUES (${bucketKey}, 1, NOW())
    ON CONFLICT (bucket_key) DO UPDATE
      SET
        request_count = CASE
          WHEN rate_limit_buckets.window_start < ${windowStart}
            THEN 1
          ELSE rate_limit_buckets.request_count + 1
        END,
        window_start = CASE
          WHEN rate_limit_buckets.window_start < ${windowStart}
            THEN NOW()
          ELSE rate_limit_buckets.window_start
        END
    RETURNING request_count, window_start
  )
  SELECT request_count, window_start FROM upsert
`;

  const row = rows[0] as
    | { request_count: number; window_start: string }
    | undefined;

  const count = row?.request_count ?? 1;

  if (count > limit) {
    const windowStartMs = row?.window_start
      ? new Date(row.window_start).getTime()
      : Date.now();
    const retryAfterSec = Math.ceil(
      (windowStartMs + windowMs - Date.now()) / 1000,
    );
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  return { allowed: true, remaining: limit - count };
}

export function rateLimitKey(
  preset: RateLimitPreset,
  ipHash: string | null,
  suffix?: string,
): string {
  return `${preset}:${ipHash ?? "unknown"}${suffix ? `:${suffix}` : ""}`;
}
