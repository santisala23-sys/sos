"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Clock,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";
import { ScanMessageThread } from "@/components/shared/ScanMessageThread";
import { Button } from "@/components/ui/Button";

type LogDetailViewProps = {
  log: ScanLogWithProfile;
};

export function LogDetailView({ log }: LogDetailViewProps) {
  const router = useRouter();
  const hasLocation = log.latitude != null && log.longitude != null;
  const lat = Number(log.latitude);
  const lng = Number(log.longitude);
  const isSos = log.alert_type === "sos";

  useEffect(() => {
    fetch(`/api/scan-logs/${log.id}`, { method: "PATCH" });
  }, [log.id]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <button
        type="button"
        onClick={() => router.push("/dashboard#actividad")}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-white/80 hover:text-violet-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a actividad
      </button>

      <section
        className={`overflow-hidden rounded-[1.75rem] border shadow-xl ${
          isSos
            ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-red-500/10"
            : "border-white/90 bg-white/95 shadow-violet-500/10"
        }`}
      >
        <div
          className={`h-1 ${isSos ? "bg-red-500" : "bg-gradient-to-r from-violet-500 to-indigo-600"}`}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-4">
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                isSos
                  ? "bg-red-600 text-white shadow-red-500/30"
                  : "bg-violet-100 text-violet-800 shadow-violet-500/20"
              }`}
            >
              {isSos ? (
                <AlertTriangle className="h-7 w-7" aria-hidden />
              ) : (
                <Clock className="h-7 w-7" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Detalle del evento
              </p>
              <h1 className="mt-1 text-2xl font-black text-neutral-900 sm:text-3xl">
                {log.beneficiary_name}
              </h1>
              <p className="mt-2 text-lg font-bold text-neutral-800">
                {alertTypeLabel(log.alert_type)}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {formatDateTime(log.scanned_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 sm:p-8">
        <ScanMessageThread scanLogId={log.id} mode="tutor" />
      </section>

      {hasLocation ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/95 shadow-xl shadow-violet-500/8">
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 sm:px-6">
            <span className="inline-flex items-center gap-2 font-bold text-neutral-900">
              <MapPin className="h-5 w-5 text-violet-600" aria-hidden />
              Ubicación del escaneo
            </span>
            <a
              href={getGoogleMapsUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Abrir en Maps
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          <iframe
            title="Mapa de ubicación del escaneo"
            src={getGoogleMapsEmbedUrl(lat, lng)}
            className="h-72 w-full border-0 sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-5 py-3 sm:px-6">
            <p className="font-mono text-xs text-neutral-500">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
            <a
              href={getGoogleMapsUrl(lat, lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Si el mapa no carga, abrir en Google Maps
            </a>
          </div>
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-dashed border-violet-200 bg-violet-50/40 px-6 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-violet-400" aria-hidden />
          <p className="font-semibold text-neutral-800">
            Sin ubicación GPS
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            No se compartió ubicación en este evento.
          </p>
        </section>
      )}

      <Link href="/dashboard#actividad">
        <Button type="button" variant="secondary" className="w-full sm:w-auto">
          Volver al panel
        </Button>
      </Link>
    </main>
  );
}
