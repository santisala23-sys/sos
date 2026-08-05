"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity } from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
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

  const latestUnread = logs.find((log) => !log.read_at);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {!loading && unreadCount > 0 && (
        <AlertBanner
          unreadCount={unreadCount}
          latestLogId={latestUnread?.id}
        />
      )}

      <section className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-xl shadow-violet-500/8 backdrop-blur-sm sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <Activity className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
              Actividad
            </h1>
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
