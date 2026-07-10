import { createHmac, timingSafeEqual } from "node:crypto";

/** Minutos de validez del código de verificación. */
export const VERIFICATION_CODE_TTL_MS = 15 * 60 * 1000;
/** Segundos mínimos entre reenvíos de código. */
export const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;
/** Máximo de intentos fallidos antes de exigir un nuevo código. */
export const VERIFICATION_MAX_ATTEMPTS = 6;

/** Genera un código numérico de 6 dígitos. */
export function generateVerificationCode(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return n.toString().padStart(6, "0");
}

function getPepper(): string {
  return process.env.AUTH_SECRET ?? "sosme-dev-secret";
}

/** Hash determinístico del código (HMAC-SHA256 con AUTH_SECRET como pepper). */
export function hashVerificationCode(code: string): string {
  return createHmac("sha256", getPepper())
    .update(code.trim())
    .digest("hex");
}

/** Comparación en tiempo constante entre un código ingresado y el hash guardado. */
export function verifyCodeMatches(code: string, storedHash: string): boolean {
  const candidate = hashVerificationCode(code);
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
