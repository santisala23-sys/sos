"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Phone, AlertTriangle, MapPin, X, MessageSquare } from "lucide-react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";

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
  const [scanLogId, setScanLogId] = useState<string | null>(null);
  const [showGeoBanner, setShowGeoBanner] = useState(true);
  const [geoStatus, setGeoStatus] = useState<
    "idle" | "loading" | "granted" | "denied"
  >("idle");
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [note, setNote] = useState("");
  const [noteSending, setNoteSending] = useState(false);
  const [noteSent, setNoteSent] = useState(false);

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
        setScanLogId(data.scanLogId);
      }
    } catch {
      scanTriggered.current = false;
    }
  }, [profile.id]);

  useEffect(() => {
    triggerScanAlert();
  }, [triggerScanAlert]);

  async function handleShareLocation() {
    setGeoStatus("loading");
    const coords = await requestGeolocation();

    if (!coords) {
      setGeoStatus("denied");
      setShowGeoBanner(false);
      return;
    }

    if (scanLogId) {
      await fetch("/api/alerts/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanLogId,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });
    }

    setGeoStatus("granted");
    setShowGeoBanner(false);
  }

  function dismissGeoBanner() {
    setGeoStatus("denied");
    setShowGeoBanner(false);
  }

  async function handleSos() {
    setSosLoading(true);
    const coords = await requestGeolocation();

    try {
      await fetch("/api/alerts/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          userAgent: navigator.userAgent,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        }),
      });
      setSosSent(true);
    } finally {
      setSosLoading(false);
    }
  }

  async function handleSubmitNote() {
    if (!scanLogId || !note.trim()) return;
    setNoteSending(true);
    try {
      await fetch("/api/alerts/note", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanLogId, note: note.trim() }),
      });
      setNoteSent(true);
    } finally {
      setNoteSending(false);
    }
  }

  const phoneHref = `tel:${profile.emergency_contact_phone.replace(/\s/g, "")}`;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-black text-white">
      {showGeoBanner && (
        <div
          className="border-b-2 border-amber-500 bg-amber-950 px-4 py-4"
          role="dialog"
          aria-labelledby="geo-title"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
              <div>
                <p id="geo-title" className="font-bold text-amber-100">
                  Compartir ubicación
                </p>
                <p className="mt-1 text-sm text-amber-200/90">
                  Ayudá a la familia indicando dónde ocurre esta situación.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissGeoBanner}
              className="rounded p-1 text-amber-300 hover:bg-amber-900"
              aria-label="Cerrar aviso de ubicación"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleShareLocation}
              disabled={geoStatus === "loading"}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              {geoStatus === "loading" ? "Obteniendo GPS..." : "Compartir ubicación"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={dismissGeoBanner}
              className="text-amber-200 hover:bg-amber-900"
            >
              Ahora no
            </Button>
          </div>
        </div>
      )}

      {geoStatus === "granted" && (
        <p className="bg-green-900 px-4 py-2 text-center text-sm font-medium text-green-100">
          Ubicación compartida con la familia.
        </p>
      )}

      <header className="border-b-4 border-red-600 bg-red-700 px-4 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-100">
          Perfil de asistencia
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
          {profile.beneficiary_name}
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <a
          href={phoneHref}
          className="flex min-h-[72px] items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-5 text-center text-xl font-black text-white shadow-lg ring-4 ring-green-400/30 transition-transform active:scale-[0.98]"
        >
          <Phone className="h-8 w-8 shrink-0" aria-hidden />
          <span>
            Llamar a {profile.emergency_contact_name}
            <span className="mt-1 block text-base font-semibold opacity-90">
              {profile.emergency_contact_phone}
            </span>
          </span>
        </a>

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

        {profile.medical_notes && (
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

        {scanLogId && (
          <section
            aria-labelledby="note-heading"
            className="rounded-xl border-2 border-neutral-700 bg-neutral-900 p-4"
          >
            <h2
              id="note-heading"
              className="mb-2 inline-flex items-center gap-2 text-base font-bold text-neutral-200"
            >
              <MessageSquare className="h-4 w-4" aria-hidden />
              Mensaje para la familia (opcional)
            </h2>
            <p className="mb-3 text-sm text-neutral-400">
              Ej: &quot;Estoy con él en la esquina de Corrientes y Pueyrredón&quot;
            </p>
            {noteSent ? (
              <p className="rounded-lg bg-green-900/50 px-4 py-3 text-sm text-green-100">
                Mensaje enviado. La familia fue notificada.
              </p>
            ) : (
              <>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-950 px-4 py-3 text-base text-white placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none"
                  placeholder="Escribí una nota breve..."
                />
                <Button
                  type="button"
                  size="md"
                  disabled={noteSending || !note.trim()}
                  onClick={handleSubmitNote}
                  className="mt-3 w-full bg-neutral-200 text-neutral-900 hover:bg-white"
                >
                  {noteSending ? "Enviando..." : "Enviar nota a la familia"}
                </Button>
              </>
            )}
          </section>
        )}
      </main>

      <footer className="sticky bottom-0 border-t-2 border-red-800 bg-neutral-950 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
