"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, FileDown, MapPin } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ContactActions } from "@/components/public/ContactActions";
import { LocationPrompt } from "@/components/public/LocationPrompt";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";

type EmergencyProfileViewProps = {
  profile: QrProfile;
};

async function requestGeolocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!navigator.geolocation) return null;

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  });
}

export function EmergencyProfileView({ profile }: EmergencyProfileViewProps) {
  const scanTriggered = useRef(false);
  const scanLogIdRef = useRef<string | null>(null);
  const [scanLogId, setScanLogId] = useState<string | null>(null);
  const [geoPhase, setGeoPhase] = useState<
    "pending" | "loading" | "granted" | "skipped" | "denied"
  >("pending");
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const locationResolved = geoPhase === "granted" || geoPhase === "skipped";
  const hasClinicalPdf = Boolean(profile.clinical_pdf_filename);

  const triggerScanAlert = useCallback(async () => {
    if (scanTriggered.current) return;
    scanTriggered.current = true;

    try {
      const res = await fetch("/api/alerts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          userAgent: navigator.userAgent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        scanLogIdRef.current = data.scanLogId;
        setScanLogId(data.scanLogId);
      }
    } catch {
      scanTriggered.current = false;
    }
  }, [profile.id]);

  useEffect(() => {
    triggerScanAlert();
  }, [triggerScanAlert]);

  async function sendLocationToServer(
    logId: string,
    location: { latitude: number; longitude: number },
  ) {
    await fetch("/api/alerts/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scanLogId: logId,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    });
  }

  async function handleShareLocation() {
    setGeoPhase("loading");
    const location = await requestGeolocation();

    if (!location) {
      setGeoPhase("denied");
      return;
    }

    setCoords(location);

    for (let attempt = 0; attempt < 8 && !scanLogIdRef.current; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    if (scanLogIdRef.current) {
      await sendLocationToServer(scanLogIdRef.current, location);
    }

    setGeoPhase("granted");
  }

  function handleSkipLocation() {
    setGeoPhase("skipped");
  }

  async function handleSos() {
    setSosLoading(true);
    const location = coords ?? (await requestGeolocation());
    if (location) {
      setCoords(location);
      const logId = scanLogIdRef.current;
      if (logId) {
        await sendLocationToServer(logId, location);
      }
    }

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
        scanLogIdRef.current = data.scanLogId;
        setScanLogId(data.scanLogId);
      }
      setSosSent(true);
    } finally {
      setSosLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col overflow-x-hidden overscroll-y-none bg-black text-white">
      <header className="border-b-4 border-red-600 bg-red-700 px-4 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-100">
          Perfil de asistencia
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
          {profile.beneficiary_name}
        </h1>
      </header>

      {!locationResolved && (
        <LocationPrompt
          beneficiaryName={profile.beneficiary_name}
          status={
            geoPhase === "loading"
              ? "loading"
              : geoPhase === "denied"
                ? "denied"
                : "idle"
          }
          onShare={handleShareLocation}
          onSkip={handleSkipLocation}
        />
      )}

      {geoPhase === "granted" && (
        <p className="flex items-center justify-center gap-2 bg-green-900 px-4 py-2 text-center text-sm font-medium text-green-100">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          Ubicación compartida con la familia
        </p>
      )}

      <main className="flex flex-1 flex-col gap-6 px-4 py-6 pb-36">
        {locationResolved && (
          <ContactActions
            profile={profile}
            alertType="scan"
            latitude={coords?.latitude}
            longitude={coords?.longitude}
            scanLogId={scanLogId}
          />
        )}

        {locationResolved && scanLogId && (
          <ScanMessageThread
            scanLogId={scanLogId}
            slug={profile.slug}
            mode="public"
            dark
          />
        )}

        {locationResolved && profile.allergies?.trim() && (
          <section aria-labelledby="allergies-heading">
            <h2
              id="allergies-heading"
              className="mb-3 text-lg font-bold uppercase tracking-wide text-red-400"
            >
              ⚠️ Alergias
            </h2>
            <div className="rounded-xl border-2 border-red-500 bg-red-950 px-5 py-4 text-lg font-semibold leading-relaxed text-red-50">
              {profile.allergies}
            </div>
          </section>
        )}

        {locationResolved && (
          <section aria-labelledby="instructions-heading">
            <h2
              id="instructions-heading"
              className="mb-3 text-lg font-bold uppercase tracking-wide text-yellow-400"
            >
              Cosas a tener en cuenta
            </h2>
            <div className="rounded-xl border-2 border-yellow-500 bg-yellow-950 px-5 py-4 text-lg leading-relaxed text-yellow-50">
              {profile.instructions}
            </div>
          </section>
        )}

        {locationResolved && profile.medical_notes?.trim() && (
          <section aria-labelledby="medical-heading">
            <h2
              id="medical-heading"
              className="mb-2 text-base font-bold uppercase tracking-wide text-neutral-400"
            >
              Información médica
            </h2>
            <p className="rounded-lg bg-neutral-900 px-4 py-3 text-base text-neutral-200">
              {profile.medical_notes}
            </p>
          </section>
        )}

        {locationResolved && hasClinicalPdf && (
          <section aria-labelledby="clinical-pdf-heading">
            <h2
              id="clinical-pdf-heading"
              className="mb-2 text-base font-bold uppercase tracking-wide text-neutral-400"
            >
              Historial clínico
            </h2>
            <a
              href={`/api/p/${profile.slug}/clinical-pdf`}
              download={profile.clinical_pdf_filename ?? "historial-clinico.pdf"}
              className="flex min-h-[56px] items-center justify-center gap-3 rounded-xl border-2 border-blue-500 bg-blue-950 px-4 py-4 text-base font-bold text-blue-100 active:scale-[0.98]"
            >
              <FileDown className="h-6 w-6 shrink-0" aria-hidden />
              Descargar PDF — {profile.clinical_pdf_filename}
            </a>
          </section>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t-2 border-red-800 bg-neutral-950 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          type="button"
          variant="danger"
          size="xl"
          disabled={sosLoading || sosSent}
          onClick={handleSos}
          className="w-full gap-3 py-6 text-2xl"
        >
          <AlertTriangle className="h-8 w-8" aria-hidden />
          {sosSent
            ? "Alerta enviada"
            : sosLoading
              ? "Enviando alerta..."
              : "⚠️ NECESITO AYUDA / SOS"}
        </Button>
      </footer>
    </div>
  );
}
