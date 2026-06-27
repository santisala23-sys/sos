"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { getGoogleMapsEmbedUrl, getGoogleMapsUrl } from "@/lib/alerts/send-alert";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

type LogDetailViewProps = {
  log: ScanLogWithProfile;
};

export function LogDetailView({ log }: LogDetailViewProps) {
  const router = useRouter();
  const hasLocation = log.latitude != null && log.longitude != null;
  const lat = Number(log.latitude);
  const lng = Number(log.longitude);

  useEffect(() => {
    fetch(`/api/scan-logs/${log.id}`, { method: "PATCH" });
  }, [log.id]);

  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
            aria-label="Volver al panel"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-neutral-900">
              Detalle del evento
            </h1>
            <p className="text-sm text-neutral-500">{log.beneficiary_name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <section
          className={`rounded-xl border p-5 ${
            log.alert_type === "sos"
              ? "border-red-300 bg-red-50"
              : "border-neutral-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {log.alert_type === "sos" ? (
              <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden />
            ) : null}
            <p className="font-bold text-neutral-900">
              {alertTypeLabel(log.alert_type)}
            </p>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {formatDateTime(log.scanned_at)}
          </p>
        </section>

        {hasLocation && (
          <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <MapPin className="h-4 w-4" aria-hidden />
                Ubicación
              </span>
              <a
                href={getGoogleMapsUrl(lat, lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline"
              >
                Abrir en Maps
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
            <iframe
              title="Mapa de ubicación del escaneo"
              src={getGoogleMapsEmbedUrl(lat, lng)}
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <p className="px-4 py-2 text-xs text-neutral-500">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
          </section>
        )}

        {!hasLocation && (
          <section className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500">
            <MapPin className="mx-auto mb-2 h-6 w-6 text-neutral-400" aria-hidden />
            No se compartió ubicación GPS en este evento.
          </section>
        )}

        {log.scanner_note?.trim() ? (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="inline-flex items-center gap-2 font-semibold text-amber-900">
              <MessageSquare className="h-4 w-4" aria-hidden />
              Nota de quien escaneó
            </p>
            <p className="mt-3 whitespace-pre-wrap text-neutral-800">
              {log.scanner_note}
            </p>
            {log.note_added_at && (
              <p className="mt-2 text-xs text-amber-800/70">
                Enviada: {formatDateTime(log.note_added_at)}
              </p>
            )}
          </section>
        ) : (
          <section className="rounded-xl border border-neutral-200 bg-white px-4 py-5 text-sm text-neutral-500">
            Sin nota del escaneador en este evento.
          </section>
        )}

        <Link href="/dashboard">
          <Button type="button" variant="secondary" className="w-full">
            Volver al panel
          </Button>
        </Link>
      </main>
    </div>
  );
}
