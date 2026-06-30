"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ContactActions } from "@/components/public/ContactActions";
import { ScannerPushPrompt } from "@/components/public/ScannerPushPrompt";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";
import {
  clearStoredScanSession,
  getStoredScanSession,
  storeScanSession,
} from "@/lib/scan-session/storage";

type SosOnlyViewProps = {
  profile: QrProfile;
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
  const [sessionRestored, setSessionRestored] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const geoRequested = useRef(false);

  useEffect(() => {
    async function tryRestore() {
      const stored = getStoredScanSession(profile.slug);
      if (!stored) return;

      const res = await fetch(
        `/api/scan-logs/resume?slug=${encodeURIComponent(profile.slug)}&scanLogId=${encodeURIComponent(stored.scanLogId)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      if (!data.valid) {
        clearStoredScanSession(profile.slug);
        return;
      }

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
          profileId: profile.id,
          userAgent: navigator.userAgent,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScanLogId(data.scanLogId);
        storeScanSession(profile.slug, {
          scanLogId: data.scanLogId,
          geoPhase: location ? "granted" : "skipped",
        });
      }
      setSosSent(true);
    } finally {
      setSosLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-lg bg-neutral-950 text-white">
      <header className="px-4 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-400">
          Modo SOS directo
        </p>
        <h1 className="mt-2 text-3xl font-black">{profile.beneficiary_name}</h1>
        <p className="mt-2 text-sm text-neutral-400">
          {profile.profile_type === "object"
            ? "Contactá al propietario si encontraste esto"
            : profile.profile_type === "pet"
              ? "Contactá al dueño si encontraste esta mascota"
              : "Tocá el botón si necesitás ayuda ahora"}
        </p>
      </header>

      <main className="flex flex-col gap-6 px-4 pb-6 pt-2">
        <Button
          type="button"
          variant="danger"
          size="xl"
          disabled={sosLoading || sosSent}
          onClick={handleSos}
          className="min-h-[140px] w-full flex-col gap-3 py-8 text-3xl"
        >
          <AlertTriangle className="h-12 w-12" aria-hidden />
          {sosSent
            ? "Alerta enviada"
            : sosLoading
              ? "Enviando..."
              : "NECESITO AYUDA"}
        </Button>

        {sosSent && (
          <p className="rounded-xl bg-green-900/40 px-4 py-3 text-center text-sm text-green-100">
            Tu familia fue alertada. También podés llamar o escribir por WhatsApp.
          </p>
        )}

        {coords && (
          <p className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <MapPin className="h-3 w-3" aria-hidden />
            Ubicación compartida con la familia
          </p>
        )}

        {sessionRestored && (
          <p className="rounded-xl bg-violet-900/40 px-4 py-3 text-center text-sm text-violet-100">
            Retomaste la conversación anterior en este dispositivo.
          </p>
        )}

        {scanLogId && (
          <ScannerPushPrompt scanLogId={scanLogId} slug={profile.slug} dark />
        )}

        <ContactActions
          profile={profile}
          alertType="sos"
          latitude={coords?.latitude}
          longitude={coords?.longitude}
          scanLogId={scanLogId}
          compact
        />

        {scanLogId && (
          <ScanMessageThread
            scanLogId={scanLogId}
            slug={profile.slug}
            mode="public"
            dark
          />
        )}
      </main>
    </div>
  );
}
