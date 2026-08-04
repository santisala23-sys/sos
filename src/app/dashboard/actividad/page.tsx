"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Bell,
  Clock3,
  QrCode,
  Radio,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ScanLogsList } from "@/components/dashboard/ScanLogsList";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";

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

  const latestUnread = logs.find((log) => !log.read_at);
  const latestLog = logs[0];
  const sosCount = logs.filter((log) => log.alert_type === "sos").length;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {!loading && unreadCount > 0 && (
        <AlertBanner
          unreadCount={unreadCount}
          latestLogId={latestUnread?.id}
        />
      )}

      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-2xl shadow-violet-600/30 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver al panel
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-violet-200">
                <Activity className="h-4 w-4" aria-hidden />
                Actividad
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Escaneos y alertas
              </h1>
              <p className="mt-2 max-w-2xl text-base text-violet-100 sm:text-lg">
                Escaneos, alertas SOS y mensajes de quien leyó tu QR. Todo en
                un solo lugar.
              </p>
            </div>

            {!loading && unreadCount > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-300/40 bg-red-500/20 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-900/20">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-200" />
                </span>
                {unreadCount === 1 ? "1 alerta nueva" : `${unreadCount} alertas nuevas`}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div
              className={`rounded-2xl border px-4 py-4 backdrop-blur-sm ${
                !loading && unreadCount > 0
                  ? "border-red-300/70 bg-red-500/15"
                  : "border-white/20 bg-white/10"
              }`}
            >
              <div
                className={`flex items-center gap-2 ${
                  !loading && unreadCount > 0 ? "text-red-100" : "text-violet-200"
                }`}
              >
                <Bell className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Sin leer
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading ? "—" : unreadCount}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <QrCode className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Eventos
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading ? "—" : logs.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-violet-200">
                <Radio className="h-4 w-4" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  SOS
                </span>
              </div>
              <p className="mt-2 text-2xl font-black">
                {loading ? "—" : sosCount}
              </p>
            </div>
          </div>

          {!loading && latestLog && (
            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Clock3 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-violet-100">
                    Último evento
                  </p>
                  <p className="mt-1 font-bold text-white">
                    {latestLog.beneficiary_name} ·{" "}
                    {alertTypeLabel(latestLog.alert_type)}
                  </p>
                  <p className="mt-0.5 text-sm text-violet-100">
                    {formatDateTime(latestLog.scanned_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
              Historial completo
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600 sm:text-base">
              Tocá un evento para chatear en vivo, ver ubicación y marcarlo como
              leído.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-24 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-24 animate-pulse rounded-2xl bg-violet-50" />
          </div>
        ) : (
          <ScanLogsList logs={logs} />
        )}
      </section>
    </main>
  );
}
