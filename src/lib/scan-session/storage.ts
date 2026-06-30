export const SCAN_SESSION_TTL_MS = 48 * 60 * 60 * 1000;

export type StoredGeoPhase = "pending" | "granted" | "skipped";

export type StoredScanSession = {
  scanToken: string;
  scanLogId: string;
  geoPhase: StoredGeoPhase;
  updatedAt: number;
};

function storageKey(slug: string) {
  return `sosme_scan_session_${slug}`;
}

function cookieName(slug: string) {
  return `sosme_scan_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

function readScanCookie(slug: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${cookieName(slug)}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

function writeScanCookie(slug: string, scanToken: string) {
  if (typeof document === "undefined") return;
  const maxAge = Math.floor(SCAN_SESSION_TTL_MS / 1000);
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${cookieName(slug)}=${encodeURIComponent(scanToken)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function clearScanCookie(slug: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${cookieName(slug)}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredScanSession(slug: string): StoredScanSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (raw) {
      const parsed = JSON.parse(raw) as StoredScanSession;
      if (parsed.scanToken && parsed.scanLogId && parsed.updatedAt) {
        if (Date.now() - parsed.updatedAt > SCAN_SESSION_TTL_MS) {
          clearStoredScanSession(slug);
          return null;
        }
        return parsed;
      }
    }
  } catch {
    /* fall through */
  }

  const legacyToken = readScanCookie(slug);
  if (!legacyToken) return null;

  return {
    scanToken: legacyToken,
    scanLogId: "",
    geoPhase: "pending",
    updatedAt: Date.now(),
  };
}

export function storeScanSession(
  slug: string,
  data: Pick<StoredScanSession, "scanToken" | "scanLogId" | "geoPhase">,
) {
  if (typeof window === "undefined") return;
  const payload: StoredScanSession = {
    ...data,
    updatedAt: Date.now(),
  };
  localStorage.setItem(storageKey(slug), JSON.stringify(payload));
  writeScanCookie(slug, data.scanToken);
}

export function clearStoredScanSession(slug: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(slug));
  clearScanCookie(slug);
}

export function touchScanSession(slug: string) {
  const existing = getStoredScanSession(slug);
  if (!existing) return;
  storeScanSession(slug, {
    scanToken: existing.scanToken,
    scanLogId: existing.scanLogId,
    geoPhase: existing.geoPhase,
  });
}

export function scannerAuthHeaders(scanToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${scanToken}`,
    "Content-Type": "application/json",
  };
}

export function scannerPushStorageKey(scanLogId: string) {
  return `sosme_scanner_push_${scanLogId}`;
}

export function isScannerPushRegistered(scanLogId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(scannerPushStorageKey(scanLogId)) === "1";
}

export function markScannerPushRegistered(scanLogId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(scannerPushStorageKey(scanLogId), "1");
}

export function clearScannerPushRegistered(scanLogId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(scannerPushStorageKey(scanLogId));
}
