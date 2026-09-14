"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  MessageSquare,
  AlertTriangle,
  QrCode,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ScanLogsListProps = {
  logs: ScanLogWithProfile[];
  onRefresh?: () => void;
};

export function ScanLogsList({ logs, onRefresh }: ScanLogsListProps) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closingAll, setClosingAll] = useState(false);

  async function closeLog(logId: string) {
    setClosingId(logId);
    try {
      const res = await fetch(`/api/scan-logs/${logId}`, { method: "PATCH" });
      if (res.ok) onRefresh?.();
    } finally {
      setClosingId(null);
    }
  }

  async function closeAllLogs() {
    setClosingAll(true);
    try {
      const res = await fetch("/api/scan-logs/mark-all-read", { method: "POST" });
      if (res.ok) onRefresh?.();
    } finally {
      setClosingAll(false);
    }
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <QrCode className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-4 font-semibold text-neutral-800">
          Todavía no hubo escaneos
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Cuando alguien lea tu QR, el evento aparecerá acá al instante.
        </p>
      </div>
    );
  }

  const unreadCount = logs.filter((log) => !log.read_at).length;

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-amber-950">
            Tenés <strong>{unreadCount}</strong>{" "}
            {unreadCount === 1 ? "actividad abierta" : "actividades abiertas"}.
            Cerralas cuando termines para que los nuevos escaneos queden bien
            identificados.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={closingAll}
            onClick={() => void closeAllLogs()}
            className="shrink-0 gap-2 border-amber-300 bg-white text-amber-950 hover:bg-amber-100"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {closingAll ? "Cerrando..." : "Cerrar todas"}
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {logs.map((log, index) => {
          const isUnread = !log.read_at;
          const hasNote = Boolean(log.scanner_note?.trim());
          const isLatestUnread =
            isUnread && index === logs.findIndex((l) => !l.read_at);
          const isSos = log.alert_type === "sos";
          const isClosing = closingId === log.id;

          return (
            <li key={log.id}>
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-[1.25rem] border p-4 transition-all duration-200 sm:flex-row sm:items-stretch sm:p-5",
                  isLatestUnread
                    ? "border-red-300 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 shadow-lg shadow-red-500/15 ring-2 ring-red-200/80"
                    : isUnread
                      ? "border-red-200/90 bg-red-50/70"
                      : "border-neutral-200/80 bg-white",
                )}
              >
                <Link
                  href={`/dashboard/logs/${log.id}`}
                  className="group flex min-w-0 flex-1 items-start gap-4 transition hover:opacity-95"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm",
                      isSos
                        ? "bg-red-600 text-white shadow-red-500/30"
                        : "bg-violet-100 text-violet-800",
                    )}
                  >
                    {isSos ? (
                      <AlertTriangle className="h-5 w-5" aria-hidden />
                    ) : (
                      <QrCode className="h-5 w-5" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-neutral-900">{log.beneficiary_name}</p>
                      {isUnread ? (
                        <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                          Abierta
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-semibold text-neutral-700">
                          Cerrada
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-600">
                      {alertTypeLabel(log.alert_type)} · {formatDateTime(log.scanned_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {log.latitude != null && log.longitude != null && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                            log.location_is_approximate
                              ? "bg-violet-100 text-violet-800"
                              : "bg-green-100 text-green-800",
                          )}
                        >
                          <MapPin className="h-3 w-3" aria-hidden />
                          {log.location_is_approximate
                            ? "Zona aproximada (sin GPS exacto)"
                            : "Ubicación exacta"}
                        </span>
                      )}
                      {hasNote && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          <MessageSquare className="h-3 w-3" aria-hidden />
                          Con nota
                        </span>
                      )}
                    </div>
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 sm:text-sm">
                      <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      Ver chat en vivo y ubicación
                    </p>
                  </div>
                  <ChevronRight
                    className="mt-2 hidden h-5 w-5 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500 sm:block"
                    aria-hidden
                  />
                </Link>

                {isUnread && (
                  <div className="flex shrink-0 items-start sm:items-center">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={isClosing}
                      onClick={() => void closeLog(log.id)}
                      className="w-full gap-2 sm:w-auto"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      {isClosing ? "Cerrando..." : "Cerrar actividad"}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
