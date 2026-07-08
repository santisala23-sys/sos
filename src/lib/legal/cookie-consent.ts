export const COOKIE_CONSENT_COOKIE = "sos_cookie_consent";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  updatedAt: string; // ISO date
};

export function parseCookieConsent(raw: string | undefined | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.updatedAt !== "string") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

