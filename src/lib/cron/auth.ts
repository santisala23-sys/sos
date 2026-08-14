import { createHash, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Autoriza jobs internos.
 * - Header custom: `x-cron-secret: <CRON_SECRET>`
 * - Estándar Vercel Cron: `Authorization: Bearer <CRON_SECRET>`
 */
export function assertCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("x-cron-secret")?.trim();
  if (header && safeEqual(header, secret)) return true;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token && safeEqual(token, secret)) return true;
  }

  return false;
}
