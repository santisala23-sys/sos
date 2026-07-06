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
import { ScannerPushPrompt } from "@/components/public/ScannerPushPrompt";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";
import { getProfileTypeConfig } from "@/lib/profile-types";
import {
  clearStoredScanSession,
  getStoredScanSession,
  scannerAuthHeaders,
  storeScanSession,
} from "@/lib/scan-session/storage";

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

  return (
    <div className="relative mx-auto min-h-dvh max-w-lg bg-neutral-950 text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-red-950/80 via-red-950/30 to-transparent"
        aria-hidden
      />

      <header className="relative border-b border-red-900/50 bg-gradient-to-br from-red-700 via-red-800 to-red-950 px-5 pb-6 pt-8 text-center shadow-lg shadow-red-950/50">
        <p className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-950/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-red-100">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
          Modo SOS directo
        </p>
        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {profile.beneficiary_name}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-red-100/90">
          {subtitle}
        </p>
      </header>

      <aside className="border-b border-neutral-800/80 bg-neutral-900/90 px-4 py-3 text-center text-xs leading-relaxed text-neutral-400">
        En emergencia grave llamá al{" "}
        <strong className="text-white">911</strong> además de usar este botón.{" "}
        <Link
          href="/aviso-escaneadores-publicos"
          className="font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
        >
          Qué datos se registran
        </Link>
      </aside>

      <main className="relative space-y-5 px-4 py-5 pb-[calc(10.5rem+env(safe-area-inset-bottom))]">
        {(sosSent || sessionRestored || coords) && (
          <div className="flex flex-col gap-2">
            {sosSent && (
              <div className="flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-950/50 px-4 py-3.5">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-green-400"
                  aria-hidden
                />
                <div>
                  <p className="font-semibold text-green-100">Alerta enviada</p>
                  <p className="mt-0.5 text-sm text-green-200/80">
                    La familia fue notificada. También podés llamar o escribir por
                    WhatsApp abajo.
                  </p>
                </div>
              </div>
            )}

            {sessionRestored && !sosSent && (
              <div className="rounded-2xl border border-violet-500/30 bg-violet-950/40 px-4 py-3 text-center text-sm text-violet-100">
                Retomaste la conversación anterior en este dispositivo.
              </div>
            )}

            {coords && (
              <p className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900/80 px-3 py-2.5 text-xs font-medium text-neutral-400">
                <MapPin className="h-3.5 w-3.5 text-green-400" aria-hidden />
                Ubicación compartida con la familia
              </p>
            )}
          </div>
        )}

        <section
          aria-labelledby="sos-contacts-heading"
          className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl"
        >
          <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600/20 text-green-400">
                <Phone className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <h2
                  id="sos-contacts-heading"
                  className="text-base font-bold text-white"
                >
                  Contactar a la familia
                </h2>
                <p className="text-xs text-neutral-500">
                  Llamá o escribí por WhatsApp en cualquier momento
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-4">
            <ContactActions
              profile={profile}
              alertType="sos"
              latitude={coords?.latitude}
              longitude={coords?.longitude}
              scanLogId={scanLogId}
              variant="emergency"
            />
          </div>
        </section>

        {hasActiveSession ? (
          <section
            aria-labelledby="sos-chat-heading"
            className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 shadow-xl"
          >
            <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-300">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h2
                    id="sos-chat-heading"
                    className="text-base font-bold text-white"
                  >
                    Mensaje a la familia
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Escribí acá; ellos responden desde su panel SOSme
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <ScannerPushPrompt
                scanToken={scanToken!}
                scanLogId={scanLogId!}
                dark
              />
              <div className="mt-4">
                <ScanMessageThread
                  scanLogId={scanLogId!}
                  scanToken={scanToken!}
                  mode="public"
                  dark
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-5 text-center">
            <MessageCircle
              className="mx-auto h-8 w-8 text-neutral-600"
              aria-hidden
            />
            <p className="mt-2 text-sm font-medium text-neutral-400">
              Chat con la familia
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
              Después de tocar &quot;Necesito ayuda&quot; vas a poder enviar mensajes en
              vivo desde acá.
            </p>
          </section>
        )}

        <p className="text-center text-[11px] leading-relaxed text-neutral-600">
          {typeConfig.publicHeader} · SOSme
        </p>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-red-900/60 bg-neutral-950/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
        <p className="mb-3 text-center text-xs text-red-200/80">
          Mantené presionado mentalmente el <strong className="text-white">911</strong>{" "}
          si la situación es grave.
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
