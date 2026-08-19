"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Droplet,
  FileDown,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { PublicEmergencyProfile } from "@/types/database";
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
  touchScanSession,
} from "@/lib/scan-session/storage";
import {
  geolocationErrorMessage,
  requestGeolocation,
} from "@/lib/utils/geolocation";

type EmergencyProfileViewProps = {
  profile: PublicEmergencyProfile;
  /** Vista del tutor: no registra escaneo ni abre chat/SOS reales. */
  previewMode?: boolean;
};

export function EmergencyProfileView({
  profile,
  previewMode = false,
}: EmergencyProfileViewProps) {
  const { isLight, toggle, mounted } = usePublicTheme();
  const t = publicThemeStyles(isLight);

  const scanTriggered = useRef(false);
  const scanTokenRef = useRef<string | null>(null);
  const scanLogIdRef = useRef<string | null>(null);
  const [scanLogId, setScanLogId] = useState<string | null>(null);
  const [scanToken, setScanToken] = useState<string | null>(null);
  const [geoPhase, setGeoPhase] = useState<
    "skipped" | "loading" | "granted" | "denied"
  >("skipped");
  const [objectSavePhase, setObjectSavePhase] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [objectSaveError, setObjectSaveError] = useState<string | null>(null);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);

  const locationShared = geoPhase === "granted";
  const isObjectProfile = profile.profile_type === "object";
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
          geoPhase: "skipped",
        });
      }
    } catch {
      scanTriggered.current = false;
    }
  }, [profile.slug]);

  useEffect(() => {
    async function initSession() {
      if (previewMode) {
        setSessionReady(true);
        return;
      }

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
                setGeoPhase("skipped");
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
  }, [profile.slug, triggerScanAlert, previewMode]);

  useEffect(() => {
    if (previewMode || !scanLogId || !scanToken) return;
    storeScanSession(profile.slug, {
      scanToken,
      scanLogId,
      geoPhase:
        geoPhase === "granted" ? "granted" : "skipped",
    });
  }, [scanLogId, scanToken, geoPhase, profile.slug]);

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
    const result = await requestGeolocation();

    if (!result.ok) {
      setGeoPhase("denied");
      return;
    }

    setCoords(result);

    for (let attempt = 0; attempt < 8 && !scanTokenRef.current; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    if (scanTokenRef.current) {
      await sendLocationToServer(result);
    }

    setGeoPhase("granted");
  }

  async function handleSaveLocation() {
    setObjectSavePhase("loading");
    setObjectSaveError(null);
    const result = await requestGeolocation();

    if (!result.ok) {
      setObjectSaveError(geolocationErrorMessage(result.reason));
      setObjectSavePhase("error");
      return;
    }

    setCoords(result);

    try {
      const res = await fetch(`/api/p/${profile.slug}/saved-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: result.latitude,
          longitude: result.longitude,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setObjectSaveError(
          data.error ??
            "No pudimos guardar la ubicación en SOSme. Intentá de nuevo en unos segundos.",
        );
        setObjectSavePhase("error");
        return;
      }
      setObjectSavePhase("success");
      window.setTimeout(() => {
        setObjectSavePhase("idle");
        setObjectSaveError(null);
      }, 3500);
    } catch {
      setObjectSaveError(
        "Error de conexión al guardar. Revisá tu internet e intentá de nuevo.",
      );
      setObjectSavePhase("error");
    }
  }

  async function handleSos() {
    setSosLoading(true);
    const cached = coords;
    let location = cached;
    if (!location) {
      const result = await requestGeolocation();
      if (result.ok) {
        location = result;
        setCoords(result);
      }
    }

    if (location && scanTokenRef.current) {
      await sendLocationToServer(location);
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

  if (!mounted) {
    return <div className="min-h-dvh bg-neutral-950" />;
  }

  return (
    <div className={t.page}>
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b ${
          isLight
            ? "from-violet-200/50 via-indigo-100/30 to-transparent"
            : "from-violet-950/60 via-indigo-950/20 to-transparent"
        }`}
        aria-hidden
      />

      <header className={t.headerAssistance}>
        <PublicThemeToggle
          isLight={isLight}
          onToggle={toggle}
          className="absolute right-4 top-4 z-10"
        />
        <p className={t.badge}>
          <HeartPulse className="h-3.5 w-3.5" aria-hidden />
          {typeConfig.publicTypeLabel}
        </p>
        <h1 className="mt-4 break-words text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {profile.beneficiary_name}
        </h1>
        {profile.avatar_b64 && (
          <div className="mt-5 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:${profile.avatar_mime ?? "image/jpeg"};base64,${profile.avatar_b64}`}
              alt={profile.beneficiary_name}
              className="h-28 w-28 rounded-full border-4 border-white/80 object-cover shadow-lg sm:h-32 sm:w-32"
            />
          </div>
        )}
      </header>

      <aside className={t.strip}>
        {previewMode ? (
          <>
            <strong className={t.stripStrong}>Vista previa del tutor</strong> — así
            ven quienes escanean el QR. No se registra escaneo ni alertas.
          </>
        ) : (
          <>
            Al abrir este QR se notifica al tutor. En emergencia grave llamá al{" "}
            <strong className={t.stripStrong}>911</strong>.{" "}
            <Link href="/aviso-escaneadores-publicos" className={t.stripLink}>
              Qué datos se registran
            </Link>
          </>
        )}
      </aside>

      {sessionRestored && sessionReady && (
        <p className={t.statusViolet}>
          Retomaste la conversación anterior en este dispositivo.
        </p>
      )}

      <main
        className={`relative space-y-5 px-4 py-5 ${
          previewMode
            ? "pb-8"
            : "pb-[calc(10.5rem+env(safe-area-inset-bottom))]"
        }`}
      >
        {!sessionReady && <p className={t.loading}>Cargando...</p>}

        {sessionReady && (
          <>
            {isObjectProfile && !previewMode && (
              <section
                aria-labelledby="save-location-heading"
                className={t.card}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <span className={t.iconWrapGreen}>
                      <MapPin className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 id="save-location-heading" className={t.cardTitle}>
                        Guardar ubicación
                      </h2>
                      <p className={t.cardSubtitle}>
                        Marcá dónde dejaste {profile.beneficiary_name}. Podés
                        escanear de nuevo cada vez que lo muevas.
                      </p>
                    </div>
                  </div>

                  {objectSavePhase === "success" && (
                    <p
                      className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
                        isLight
                          ? "bg-green-50 text-green-800"
                          : "bg-green-950/50 text-green-200"
                      }`}
                      role="status"
                    >
                      Ubicación guardada. La ves en tu panel de SOSme.
                    </p>
                  )}

                  {objectSavePhase === "error" && objectSaveError && (
                    <p
                      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                        isLight
                          ? "bg-amber-50 text-amber-900"
                          : "bg-amber-950/40 text-amber-100"
                      }`}
                      role="alert"
                    >
                      {objectSaveError}
                    </p>
                  )}

                  <Button
                    type="button"
                    size="xl"
                    disabled={objectSavePhase === "loading"}
                    onClick={handleSaveLocation}
                    className="mt-4 w-full gap-2 bg-sky-500 py-5 text-lg font-black tracking-wide text-white hover:bg-sky-400"
                  >
                    <MapPin className="h-6 w-6" aria-hidden />
                    {objectSavePhase === "loading"
                      ? "Guardando..."
                      : "GUARDAR UBICACIÓN"}
                  </Button>
                </div>
              </section>
            )}

            <section aria-labelledby="contacts-heading" className={t.card}>
              <div className={t.cardHeader}>
                <div className="flex items-center gap-2">
                  <span className={t.iconWrapGreen}>
                    <Phone className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h2 id="contacts-heading" className={t.cardTitle}>
                      Contactos de emergencia
                    </h2>
                    <p className={t.cardSubtitle}>
                      Llamá o escribí por WhatsApp a la familia
                    </p>
                  </div>
                </div>
              </div>
              {!previewMode && !isObjectProfile && (
              <div className={`border-b px-4 py-4 ${isLight ? "border-neutral-100 bg-neutral-50/80" : "border-white/10 bg-white/5"}`}>
                {locationShared ? (
                  <p className={`flex items-center gap-2 text-sm font-semibold ${isLight ? "text-green-800" : "text-green-300"}`}>
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    Ubicación compartida con la familia
                  </p>
                ) : (
                  <div className="space-y-3">
                    {geoPhase === "denied" && (
                      <p className={`text-sm ${isLight ? "text-amber-900" : "text-amber-200"}`}>
                        No pudimos obtener tu ubicación. Podés intentarlo de nuevo cuando quieras.
                      </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        size="lg"
                        disabled={geoPhase === "loading"}
                        onClick={handleShareLocation}
                        className="w-full gap-2 bg-amber-500 font-bold text-black hover:bg-amber-400 sm:w-auto"
                      >
                        <MapPin className="h-5 w-5" aria-hidden />
                        {geoPhase === "loading"
                          ? "Obteniendo GPS..."
                          : "Compartir mi ubicación"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              )}
              <div className="p-4">
                <ContactActions
                  profile={profile}
                  alertType="scan"
                  latitude={coords?.latitude}
                  longitude={coords?.longitude}
                  scanLogId={scanLogId}
                  variant="emergency"
                  isLight={isLight}
                />
              </div>
            </section>

            {scanLogId && scanToken && !previewMode && (
              <section aria-labelledby="chat-heading" className={t.card}>
                <div className={t.cardHeader}>
                  <div className="flex items-center gap-2">
                    <span className={t.iconWrapViolet}>
                      <MessageCircle className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <h2 id="chat-heading" className={t.cardTitle}>
                        Mensaje a la familia
                      </h2>
                      <p className={t.cardSubtitle}>
                        Coordiná la asistencia en tiempo real
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <ScannerPushPrompt
                    scanToken={scanToken}
                    scanLogId={scanLogId}
                    dark={!isLight}
                  />
                  <div className="mt-4">
                    <ScanMessageThread
                      scanLogId={scanLogId}
                      scanToken={scanToken}
                      mode="public"
                      dark={!isLight}
                    />
                  </div>
                </div>
              </section>
            )}

            {typeConfig.showAllergies && profile.allergies?.trim() && (
              <section aria-labelledby="allergies-heading" className={t.card}>
                <div className="p-5">
                  <h2 id="allergies-heading" className={t.sectionHeadingRed}>
                    ⚠️ {typeConfig.allergiesLabel}
                  </h2>
                  <div className={t.infoAllergies}>{profile.allergies}</div>
                </div>
              </section>
            )}

            {profile.instructions?.trim() && (
            <section aria-labelledby="instructions-heading" className={t.card}>
              <div className="p-5">
                <h2 id="instructions-heading" className={t.sectionHeadingYellow}>
                  {typeConfig.instructionsLabel}
                </h2>
                <div className={t.infoInstructions}>{profile.instructions}</div>
              </div>
            </section>
            )}

            {typeConfig.showMedicalNotes && profile.medical_notes?.trim() && (
              <section aria-labelledby="medical-heading" className={t.card}>
                <div className="p-5">
                  <h2 id="medical-heading" className={t.sectionHeadingMuted}>
                    {typeConfig.medicalNotesLabel}
                  </h2>
                  <p className={t.infoMedical}>{profile.medical_notes}</p>
                </div>
              </section>
            )}

            {typeConfig.showBloodType && profile.blood_type?.trim() && (
              <section aria-labelledby="blood-type-heading" className={t.card}>
                <div className="p-5">
                  <h2 id="blood-type-heading" className={t.sectionHeadingViolet}>
                    Tipo de sangre
                  </h2>
                  <div className={t.infoBlood}>
                    <Droplet className={t.bloodIcon} aria-hidden />
                    <p className={t.bloodType}>{profile.blood_type}</p>
                  </div>
                </div>
              </section>
            )}

            {hasClinicalPdf && scanToken && (
              <section aria-labelledby="clinical-pdf-heading" className={t.card}>
                <div className="p-5">
                  <h2 id="clinical-pdf-heading" className={t.sectionHeadingMuted}>
                    Historial clínico
                  </h2>
                  <button
                    type="button"
                    onClick={downloadClinicalPdf}
                    className={t.pdfButton}
                  >
                    <FileDown className="h-6 w-6 shrink-0" aria-hidden />
                    Descargar PDF — {profile.clinical_pdf_filename}
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        <p className={t.footerBrand}>{typeConfig.publicHeader} · SOSme</p>
      </main>

      {!previewMode && (
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
          className="w-full gap-2 whitespace-normal px-4 py-5 text-lg leading-tight sm:gap-3 sm:py-6 sm:text-2xl"
        >
          <AlertTriangle className="h-7 w-7 shrink-0 sm:h-8 sm:w-8" aria-hidden />
          {sosSent
            ? "Alerta enviada"
            : sosLoading
              ? "Enviando alerta..."
              : "NECESITO AYUDA / SOS"}
        </Button>
      </footer>
      )}
    </div>
  );
}
