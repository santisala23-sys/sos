"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Archive, ChevronLeft } from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";

export default function ClosedActividadPage() {
  const [logs, setLogs] = useState<ScanLogWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    const res = await fetch("/api/scan-logs");
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const closedCount = logs.filter((log) => Boolean(log.read_at)).length;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/dashboard/actividad"
        className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 shadow-sm transition hover:bg-violet-50"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <Activity className="h-4 w-4" aria-hidden />
        Volver a actividad
      </Link>

      <section className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 shadow-sm">
            <Archive className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
              Actividades cerradas
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Eventos que ya cerraste. Podés revisar el chat y la ubicación, pero
              no aparecen en la lista principal.
              {!loading && closedCount > 0 && (
                <>
                  {" "}
                  Tenés <strong>{closedCount}</strong>{" "}
                  {closedCount === 1 ? "cerrada" : "cerradas"}.
                </>
              )}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
            <div className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        ) : (
          <ScanLogsList logs={logs} variant="closed" />
        )}
      </section>
    </main>
  );
}
