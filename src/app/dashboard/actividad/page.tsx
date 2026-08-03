"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";

export default function ActividadPage() {
  const [logs, setLogs] = useState<ScanLogWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    const res = await fetch("/api/scan-logs");
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 15000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al panel
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
              <Activity className="h-4 w-4" aria-hidden />
              Actividad
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-neutral-900">
              Escaneos y alertas
            </h1>
            <p className="mt-1 text-neutral-600">
              Escaneos, alertas SOS y mensajes de quien leyó tu QR.
            </p>
          </div>
          {!loading && unreadCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
              {unreadCount === 1
                ? "1 sin leer"
                : `${unreadCount > 9 ? "9+" : unreadCount} sin leer`}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-violet-50" />
          <div className="h-20 animate-pulse rounded-2xl bg-violet-50" />
          <div className="h-20 animate-pulse rounded-2xl bg-violet-50" />
        </div>
      ) : (
        <ScanLogsList logs={logs} />
      )}
    </main>
  );
}
