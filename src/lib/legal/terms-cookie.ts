import { LEGAL_VERSION, TERMS_PENDING_COOKIE } from "@/lib/legal/constants";

const TERMS_PENDING_MAX_AGE = 60 * 10; // 10 minutos

export function termsPendingCookieOptions() {
  return {
    name: TERMS_PENDING_COOKIE,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: TERMS_PENDING_MAX_AGE,
  };
}

export function clearTermsPendingCookieOptions() {
  return {
    name: TERMS_PENDING_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function legalAcceptancePayload() {
  return {
    termsVersion: LEGAL_VERSION,
    privacyVersion: LEGAL_VERSION,
  };
}
