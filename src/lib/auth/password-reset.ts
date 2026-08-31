import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const PASSWORD_RESET_COOLDOWN_MS = 60 * 1000;

function getPepper(): string {
  return process.env.AUTH_SECRET ?? "sosme-dev-secret";
}

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
  return createHmac("sha256", getPepper())
    .update(`pwd-reset:${token.trim()}`)
    .digest("hex");
}

export function verifyPasswordResetToken(
  token: string,
  storedHash: string,
): boolean {
  const candidate = hashPasswordResetToken(token);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
