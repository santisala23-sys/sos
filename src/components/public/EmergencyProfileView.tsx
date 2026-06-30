"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Droplet, FileDown, MapPin } from "lucide-react";
import type { PublicQrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ContactActions } from "@/components/public/ContactActions";
import { LocationPrompt } from "@/components/public/LocationPrompt";
import { ScannerPushPrompt } from "@/components/public/ScannerPushPrompt";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";
import { getProfileTypeConfig } from "@/lib/profile-types";
import {
  clearStoredScanSession,
  getStoredScanSession,
  scannerAuthHeaders,
  storeScanSession,
  touchScanSession,
} from "@/lib/scan-session/storage";

type EmergencyProfileViewProps = {
  profile: PublicQrProfile;
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
  const scanTokenRef = useRef<string | null>(null);
  const scanLogIdRef = useRef<string | null>(null);
  const [scanLogId, setScanLogId] = useState<string | null>(null);
  const [scanToken, setScanToken] = useState<string | null>(null);
  const [geoPhase, setGeoPhase] = useState<
    "pending" | "loading" | "granted" | "skipped" | "denied"
  >("pending");
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  const locationResolved = geoPhase === "granted" || geoPhase === "skipped";
  const typeConfig = getProfileTypeConfig(profile.profile_type);
  const hasClinicalPdf =
    typeConfig.showClinicalPdf && Boolean(profile.clinical_pdf_filename);

  const triggerScanAlert = useCallback(async () => {
    if (scanTriggered.current) return;
    scanTriggered.current = true;

    try {
      const res = await fetch("/api/alerts/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: profile.slug,
          userAgent: navigator.userAgent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        scanTokenRef.current = data.scanToken;
        scanLogIdRef.current = data.scanLogId;
        setScanToken(data.scanToken);
        setScanLogId(data.scanLogId);
        storeScanSession(profile.slug, {
          scanToken: data.scanToken,
          scanLogId: data.scanLogId,
          geoPhase: "pending",
        });
      }
    } catch {
      scanTriggered.current = false;
    }
  }, [profile.slug]);

  useEffect(() => {
    async function initSession() {
      const stored = getStoredScanSession(profile.slug);
      if (stored?.scanToken) {
        try {
          const res = await fetch(
            `/api/scan-logs/resume?scanToken=${encodeURIComponent(stored.scanToken)}`,
          );
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              scanTriggered.current = true;
              scanTokenRef.current = data.scanToken ?? stored.scanToken;
              scanLogIdRef.current = data.scanLogId;
              setScanToken(scanTokenRef.current);
              setScanLogId(data.scanLogId);

              const hasServerCoords =
                data.latitude != null && data.longitude != null;
              if (hasServerCoords) {
                setCoords({
                  latitude: data.latitude,
                  longitude: data.longitude,
                });
                setGeoPhase("granted");
              } else if (
                stored.geoPhase === "granted" ||
                stored.geoPhase === "skipped"
              ) {
                setGeoPhase(stored.geoPhase);
              } else {
                setGeoPhase("pending");
              }

              setSessionRestored(true);
              touchScanSession(profile.slug);
              setSessionReady(true);
              return;
            }
          }
        } catch {
          /* fall through */
        }
        clearStoredScanSession(profile.slug);
      }

      await triggerScanAlert();
      setSessionReady(true);
    }

    initSession();
  }, [profile.slug, triggerScanAlert]);

  useEffect(() => {
    if (!scanLogId || !scanToken) return;
    if (!locationResolved) return;
    storeScanSession(profile.slug, {
      scanToken,
      scanLogId,
      geoPhase: geoPhase === "granted" ? "granted" : "skipped",
    });
  }, [scanLogId, scanToken, locationResolved, geoPhase, profile.slug]);

  useEffect(() => {
    if (scanLogId && sessionRestored) {
      touchScanSession(profile.slug);
    }
  }, [scanLogId, sessionRestored, profile.slug]);

  async function sendLocationToServer(location: {
    latitude: number;
    longitude: number;
  }) {
    const token = scanTokenRef.current;
    if (!token) return;

    await fetch("/api/alerts/location", {
      method: "PATCH",
      headers: scannerAuthHeaders(token),
      body: JSON.stringify({
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

    for (let attempt = 0; attempt < 8 && !scanTokenRef.current; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    if (scanTokenRef.current) {
      await sendLocationToServer(location);
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
      if (scanTokenRef.current) {
        await sendLocationToServer(location);
      }
    }

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
        scanLogIdRef.current = data.scanLogId;
        setScanToken(data.scanToken);
        setScanLogId(data.scanLogId);
        storeScanSession(profile.slug, {
          scanToken: data.scanToken,
          scanLogId: data.scanLogId,
          geoPhase: location ? "granted" : "skipped",
        });
      }
      setSosSent(true);
    } finally {
      setSosLoading(false);
    }
  }

  async function downloadClinicalPdf() {
    const token = scanTokenRef.current;
    if (!token) return;

    const res = await fetch(`/api/p/${profile.slug}/clinical-pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = profile.clinical_pdf_filename ?? "historial-clinico.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative mx-auto max-w-lg bg-black text-white">
      <header className="border-b-4 border-red-600 bg-red-700 px-4 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-100">
          {typeConfig.publicHeader}
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
          {profile.beneficiary_name}
        </h1>
      </header>

      <aside className="border-b border-neutral-800 bg-neutral-900/90 px-4 py-3 text-center text-xs leading-relaxed text-neutral-300">
        Al abrir este QR se notifica al tutor. En emergencia grave llamá al{" "}
        <strong className="text-white">911</strong>.{" "}
        <a
          href="/aviso-escaneadores-publicos"
          className="font-medium text-violet-300 underline underline-offset-2 hover:text-violet-200"
        >
          Qué datos se registran
        </a>
      </aside>

      {sessionRestored && locationResolved && (
        <p className="bg-violet-950 px-4 py-2 text-center text-sm font-medium text-violet-100">
          Retomaste la conversación anterior en este dispositivo.
        </p>
      )}

      {!locationResolved && sessionReady && (
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

      {geoPhase === "skipped" && (
        <p className="bg-amber-950 px-4 py-2 text-center text-sm font-medium text-amber-100">
          Continuaste sin compartir ubicación. Los contactos de emergencia están disponibles.
        </p>
      )}

      {geoPhase === "granted" && (
        <p className="flex items-center justify-center gap-2 bg-green-900 px-4 py-2 text-center text-sm font-medium text-green-100">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          Ubicación compartida con la familia
        </p>
      )}

      {sessionReady && locationResolved && scanLogId && scanToken && (
        <div className="px-4 pt-4">
          <ScannerPushPrompt scanToken={scanToken} scanLogId={scanLogId} dark />
        </div>
      )}

      <main className="flex flex-col gap-6 px-4 py-6 pb-[calc(8.5rem+env(safe-area-inset-bottom))]">
        {!sessionReady && (
          <p className="py-8 text-center text-sm text-neutral-400">
            Cargando...
          </p>
        )}

        {sessionReady && locationResolved && (
          <ContactActions
            profile={profile}
            alertType="scan"
            latitude={coords?.latitude}
            longitude={coords?.longitude}
            scanLogId={scanLogId}
          />
        )}

        {locationResolved && scanLogId && scanToken && (
          <ScanMessageThread
            scanLogId={scanLogId}
            scanToken={scanToken}
            mode="public"
            dark
          />
        )}

        {locationResolved && typeConfig.showAllergies && profile.allergies?.trim() && (
          <section aria-labelledby="allergies-heading">
            <h2
              id="allergies-heading"
              className="mb-3 text-lg font-bold uppercase tracking-wide text-red-400"
            >
              ⚠️ {typeConfig.allergiesLabel}
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
              {typeConfig.instructionsLabel}
            </h2>
            <div className="rounded-xl border-2 border-yellow-500 bg-yellow-950 px-5 py-4 text-lg leading-relaxed text-yellow-50">
              {profile.instructions}
            </div>
          </section>
        )}

        {locationResolved && typeConfig.showMedicalNotes && profile.medical_notes?.trim() && (
          <section aria-labelledby="medical-heading">
            <h2
              id="medical-heading"
              className="mb-2 text-base font-bold uppercase tracking-wide text-neutral-400"
            >
              {typeConfig.medicalNotesLabel}
            </h2>
            <p className="rounded-lg bg-neutral-900 px-4 py-3 text-base text-neutral-200">
              {profile.medical_notes}
            </p>
          </section>
        )}

        {locationResolved && hasClinicalPdf && scanToken && (
          <section aria-labelledby="clinical-pdf-heading">
            <h2
              id="clinical-pdf-heading"
              className="mb-2 text-base font-bold uppercase tracking-wide text-neutral-400"
            >
              Historial clínico
            </h2>
            <button
              type="button"
              onClick={downloadClinicalPdf}
              className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border-2 border-violet-500 bg-violet-950 px-4 py-4 text-base font-bold text-violet-100 active:scale-[0.98]"
            >
              <FileDown className="h-6 w-6 shrink-0" aria-hidden />
              Descargar PDF — {profile.clinical_pdf_filename}
            </button>
          </section>
        )}

        {locationResolved &&
          typeConfig.showBloodType &&
          profile.blood_type?.trim() && (
            <section aria-labelledby="blood-type-heading">
              <h2
                id="blood-type-heading"
                className="mb-3 text-lg font-bold uppercase tracking-wide text-violet-300"
              >
                Tipo de sangre
              </h2>
              <div className="flex items-center gap-4 rounded-xl border-2 border-violet-500 bg-violet-950 px-5 py-4">
                <Droplet className="h-8 w-8 shrink-0 text-violet-300" aria-hidden />
                <p className="text-3xl font-black tracking-wide text-white sm:text-4xl">
                  {profile.blood_type}
                </p>
              </div>
            </section>
          )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t-2 border-red-800 bg-neutral-950 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="mb-3 text-center text-xs text-red-200/90">
          En emergencia grave, llamá al <strong>911</strong> además de usar este botón.
        </p>
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
              : "NECESITO AYUDA / SOS"}
        </Button>
      </footer>
    </div>
  );
}
