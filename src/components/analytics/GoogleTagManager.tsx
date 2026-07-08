"use client";

import { useEffect } from "react";
import {
  COOKIE_CONSENT_COOKIE,
  parseCookieConsent,
} from "@/lib/legal/cookie-consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CONSENT_EVENT = "sos-cookie-consent-updated";

function readConsentCookie(): ReturnType<typeof parseCookieConsent> {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_CONSENT_COOKIE}=`;
  for (const part of document.cookie.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return parseCookieConsent(
        decodeURIComponent(trimmed.slice(prefix.length)),
      );
    }
  }
  return null;
}

function loadGtm() {
  if (!GTM_ID || typeof window === "undefined") return;
  if (document.getElementById("gtm-script")) return;

  const w = window as Window & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

  const script = document.createElement("script");
  script.id = "gtm-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);
}

function maybeLoadGtm() {
  const consent = readConsentCookie();
  if (consent?.analytics) {
    loadGtm();
  }
}

export function GoogleTagManager() {
  useEffect(() => {
    maybeLoadGtm();

    const onConsentUpdate = () => maybeLoadGtm();
    window.addEventListener(CONSENT_EVENT, onConsentUpdate);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentUpdate);
  }, []);

  if (!GTM_ID) return null;

  const consent = typeof document !== "undefined" ? readConsentCookie() : null;
  if (!consent?.analytics) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}

export function notifyCookieConsentUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }
}
