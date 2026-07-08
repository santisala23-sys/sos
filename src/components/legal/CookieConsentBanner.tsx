"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { notifyCookieConsentUpdated } from "@/components/analytics/GoogleTagManager";
import { COOKIE_CONSENT_COOKIE, type CookieConsent } from "@/lib/legal/cookie-consent";

const CONSENT_MAX_AGE_DAYS = 180;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split("; ").map((c) => c.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    if (key === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

function writeCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function hasConsentCookie(): boolean {
  const raw = readCookie(COOKIE_CONSENT_COOKIE);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    return parsed.necessary === true;
  } catch {
    return false;
  }
}

function saveConsent(analytics: boolean) {
  const payload: CookieConsent = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  writeCookie(COOKIE_CONSENT_COOKIE, JSON.stringify(payload), CONSENT_MAX_AGE_DAYS);
  notifyCookieConsentUpdated();
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVisible(!hasConsentCookie());
  }, []);

  if (!visible) return null;

  function accept(analytics: boolean) {
    setSaving(true);
    try {
      saveConsent(analytics);
      setVisible(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <section
        className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-xl backdrop-blur"
        aria-label="Aviso de cookies"
      >
        <p className="text-sm text-neutral-800">
          Usamos cookies <strong>estrictamente necesarias</strong> para que el sitio funcione
          (sesión, seguridad y flujo de escaneo). Si aceptás «todas», también podemos usar cookies de{" "}
          <strong>analytics</strong> (Google Tag Manager) para medir el uso del sitio.{" "}
          <Link href="/cookies" className="font-semibold text-violet-700 hover:underline">
            Ver Política de Cookies
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => accept(false)}
          >
            Solo necesarias
          </Button>
          <Button type="button" size="sm" disabled={saving} onClick={() => accept(true)}>
            {saving ? "Guardando..." : "Aceptar todas"}
          </Button>
        </div>
      </section>
    </div>
  );
}
