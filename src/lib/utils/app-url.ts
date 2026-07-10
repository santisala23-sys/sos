const CANONICAL_APP_URL = "https://sosme.com.ar";

function normalizeAppUrl(raw: string | undefined): string {
  const fallback =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : CANONICAL_APP_URL;
  if (!raw?.trim()) return fallback;

  const cleaned = raw.trim().replace(/\/$/, "");
  try {
    const host = new URL(cleaned).hostname.toLowerCase();
    // Never expose preview/deployment hosts on QR / SOS links.
    if (
      host.endsWith(".vercel.app") ||
      host === "sosme.app" ||
      host === "www.sosme.app" ||
      host === "www.sosme.com.ar"
    ) {
      return CANONICAL_APP_URL;
    }
  } catch {
    return fallback;
  }
  return cleaned;
}

export function getAppUrl() {
  return normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL);
}

/** Hostname for print labels (e.g. sosme.com.ar). */
export function getAppHostname(): string {
  try {
    return new URL(getAppUrl()).hostname;
  } catch {
    return "sosme.com.ar";
  }
}
