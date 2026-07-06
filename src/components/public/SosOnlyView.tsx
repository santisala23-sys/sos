"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  ShieldAlert,
} from "lucide-react";
import type { PublicQrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ContactActions } from "@/components/public/ContactActions";
import { PublicThemeToggle } from "@/components/public/PublicThemeToggle";
import { publicThemeStyles } from "@/components/public/publicThemeStyles";
import { ScannerPushPrompt } from "@/components/public/ScannerPushPrompt";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";
import { usePublicTheme } from "@/components/public/usePublicTheme";
import { getProfileTypeConfig } from "@/lib/profile-types";
import {
  clearStoredScanSession,
  getStoredScanSession,
  scannerAuthHeaders,
  storeScanSession,
} from "@/lib/scan-session/storage";
import { cn } from "@/lib/utils/cn";

type SosOnlyViewProps = {
  profile: PublicQrProfile;
};

async function requestGeolocation() {
  if (!navigator.geolocation) return null;
  return new Promise<{ latitude: number; longitude: number } | null>(
    (resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    },
  );
}

export function SosOnlyView({ profile }: SosOnlyViewProps) {
  const { isLight, toggle, mounted } = usePublicTheme();
  const t = publicThemeStyles(isLight);

  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [scanLogId, setScanLogId] = useState<string | null>(null);
  const [scanToken, setScanToken] = useState<string | null>(null);
  const [sessionRestored, setSessionRestored] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const geoRequested = useRef(false);
  const scanTokenRef = useRef<string | null>(null);

  const typeConfig = getProfileTypeConfig(profile.profile_type);
  const hasActiveSession = Boolean(scanLogId && scanToken);

  const subtitle =
    profile.profile_type === "object"
      ? "Contactá al propietario si encontraste esto"
      : profile.profile_type === "pet"
        ? "Contactá al dueño si encontraste esta mascota"
        : "Tocá el botón si necesitás ayuda ahora";

  useEffect(() => {
    async function tryRestore() {
      const stored = getStoredScanSession(profile.slug);
      if (!stored?.scanToken) return;

      const res = await fetch(
        `/api/scan-logs/resume?scanToken=${encodeURIComponent(stored.scanToken)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data.valid) {
        clearStoredScanSession(profile.slug);
        return;
      }

      scanTokenRef.current = data.scanToken ?? stored.scanToken;
      setScanToken(scanTokenRef.current);
      setScanLogId(data.scanLogId);
      setSessionRestored(true);
      if (data.latitude != null && data.longitude != null) {
        setCoords({ latitude: data.latitude, longitude: data.longitude });
      }
      if (data.alertType === "sos") {
        setSosSent(true);
      }
    }

    tryRestore();
  }, [profile.slug]);

  const fetchGeo = useCallback(async () => {
    const c = await requestGeolocation();
    if (c) setCoords(c);
  }, []);

  useEffect(() => {
    if (!geoRequested.current) {
      geoRequested.current = true;
      fetchGeo();
    }
  }, [fetchGeo]);

  async function handleSos() {
    setSosLoading(true);
    const location = coords ?? (await requestGeolocation());
    if (location) setCoords(location);

    try {
      const res = await fetch("/api/alerts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: profile.slug,
          userAgent: navigator.userAgent,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        scanTokenRef.current = data.scanToken;
        setScanToken(data.scanToken);
        setScanLogId(data.scanLogId);
        storeScanSession(profile.slug, {
          scanToken: data.scanToken,
          scanLogId: data.scanLogId,
          geoPhase: location ? "granted" : "skipped",
        });

        if (location && data.scanToken) {
          await fetch("/api/alerts/location", {
            method: "PATCH",
            headers: scannerAuthHeaders(data.scanToken),
            body: JSON.stringify({
              latitude: location.latitude,
              longitude: location.longitude,
            }),
          });
        }
      }
      setSosSent(true);
    } finally {
      setSosLoading(false);
    }
  }

  if (!mounted) {
    return <div className="min-h-dvh bg-neutral-950" />;
  }

  return (
    <div className={t.page}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b",
          isLight
            ? "from-red-200/50 via-rose-100/30 to-transparent"
            : "from-red-950/80 via-red-950/30 to-transparent",
        )}
        aria-hidden
      />

      <header className={t.headerSos}>
        <PublicThemeToggle
          isLight={isLight}
          onToggle={toggle}
          className="absolute right-4 top-4 z-10"
        />
        <p className={t.badge}>
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
          Modo SOS directo
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {profile.beneficiary_name}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed opacity-90">
          {subtitle}
        </p>
      </header>

      <aside className={t.strip}>
        En emergencia grave llamá al{" "}
        <strong className={t.stripStrong}>911</strong> además de usar este botón.{" "}
        <Link href="/aviso-escaneadores-publicos" className={t.stripLink}>
          Qué datos se registran
        </Link>
      </aside>

      <main className="relative space-y-5 px-4 py-5 pb-[calc(10.5rem+env(safe-area-inset-bottom))]">
        {(sosSent || sessionRestored || coords) && (
          <div className="flex flex-col gap-2">
            {sosSent && (
              <div className={t.statusSuccess}>
                <CheckCircle2
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isLight ? "text-green-600" : "text-green-400",
                  )}
                  aria-hidden
                />
                <div>
                  <p className={t.statusSuccessTitle}>Alerta enviada</p>
                  <p className={t.statusSuccessText}>
                    La familia fue notificada. También podés llamar o escribir por
                    WhatsApp abajo.
                  </p>
                </div>
              </div>
            )}

            {sessionRestored && !sosSent && (
              <div className={t.statusViolet}>
                Retomaste la conversación anterior en este dispositivo.
              </div>
            )}

            {coords && (
              <p className={t.statusLocation}>
                <MapPin
                  className={cn(
                    "h-3.5 w-3.5",
                    isLight ? "text-green-600" : "text-green-400",
                  )}
                  aria-hidden
                />
                Ubicación compartida con la familia
              </p>
            )}
          </div>
        )}

        <section aria-labelledby="sos-contacts-heading" className={t.card}>
          <div className={t.cardHeader}>
            <div className="flex items-center gap-2">
              <span className={t.iconWrapGreen}>
                <Phone className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2 id="sos-contacts-heading" className={t.cardTitle}>
                  Contactar a la familia
                </h2>
                <p className={t.cardSubtitle}>
                  Llamá o escribí por WhatsApp en cualquier momento
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <ContactActions
              profile={profile}
              alertType="sos"
              latitude={coords?.latitude}
              longitude={coords?.longitude}
              scanLogId={scanLogId}
              variant="emergency"
              isLight={isLight}
            />
          </div>
        </section>

        {hasActiveSession ? (
          <section aria-labelledby="sos-chat-heading" className={t.card}>
            <div className={t.cardHeader}>
              <div className="flex items-center gap-2">
                <span className={t.iconWrapViolet}>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h2 id="sos-chat-heading" className={t.cardTitle}>
                    Mensaje a la familia
                  </h2>
                  <p className={t.cardSubtitle}>
                    Escribí acá; ellos responden desde su panel SOSme
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ScannerPushPrompt
                scanToken={scanToken!}
                scanLogId={scanLogId!}
                dark={!isLight}
              />
              <div className="mt-4">
                <ScanMessageThread
                  scanLogId={scanLogId!}
                  scanToken={scanToken!}
                  mode="public"
                  dark={!isLight}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className={t.placeholder}>
            <MessageCircle
              className={cn(
                "mx-auto h-8 w-8",
                isLight ? "text-violet-300" : "text-neutral-600",
              )}
              aria-hidden
            />
            <p className={t.placeholderTitle}>Chat con la familia</p>
            <p className={t.placeholderText}>
              Después de tocar &quot;Necesito ayuda&quot; vas a poder enviar mensajes en
              vivo desde acá.
            </p>
          </section>
        )}

        <p className={t.footerBrand}>
          {typeConfig.publicHeader} · SOSme
        </p>
      </main>

      <footer className={t.footer}>
        <p className={t.footerNote}>
          En emergencia grave, llamá al{" "}
          <strong className={t.footerNoteStrong}>911</strong> además de usar este
          botón.
        </p>
        <Button
          type="button"
          variant="danger"
          size="xl"
          disabled={sosLoading || sosSent}
          onClick={handleSos}
          className="w-full gap-3 py-6 text-2xl shadow-2xl shadow-red-900/50"
        >
          <AlertTriangle className="h-8 w-8" aria-hidden />
          {sosSent
            ? "Alerta enviada"
            : sosLoading
              ? "Enviando alerta..."
              : "NECESITO AYUDA"}
        </Button>
      </footer>
    </div>
  );
}
