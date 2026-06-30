import {
  ELIGIBLE_PENDING_COOKIE,
  LEGAL_VERSION,
  TERMS_PENDING_COOKIE,
} from "@/lib/legal/constants";

const PENDING_MAX_AGE = 60 * 10; // 10 minutos

export function termsPendingCookieOptions() {
  return pendingCookieOptions(TERMS_PENDING_COOKIE);
}

export function eligiblePendingCookieOptions() {
  return pendingCookieOptions(ELIGIBLE_PENDING_COOKIE);
}

function pendingCookieOptions(name: string) {
  return {
    name,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: PENDING_MAX_AGE,
  };
}

export function clearTermsPendingCookieOptions() {
  return clearPendingCookieOptions(TERMS_PENDING_COOKIE);
}

export function clearEligiblePendingCookieOptions() {
  return clearPendingCookieOptions(ELIGIBLE_PENDING_COOKIE);
}

function clearPendingCookieOptions(name: string) {
  return {
    name,
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
    eligibleVersion: LEGAL_VERSION,
  };
}
