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
  Archive,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ScanLogsListProps = {
  logs: ScanLogWithProfile[];
  onRefresh?: () => void;
  variant?: "open" | "closed";
};

export function ScanLogsList({
  logs,
  onRefresh,
  variant = "open",
}: ScanLogsListProps) {
  const [closingId, setClosingId] = useState<string | null>(null);
  const [closingAll, setClosingAll] = useState(false);

  const visibleLogs =
    variant === "closed"
      ? logs.filter((log) => Boolean(log.read_at))
      : logs.filter((log) => !log.read_at);

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

  if (visibleLogs.length === 0) {
    if (variant === "closed") {
      return (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600">
            <Archive className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-4 font-semibold text-neutral-800">
            No tenés actividades cerradas
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Cuando cierres un evento en Actividad, aparecerá acá.
          </p>
          <Link
            href="/dashboard/actividad"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
          >
            Volver a actividad abierta
          </Link>
        </div>
      );
    }

    const closedCount = logs.filter((log) => Boolean(log.read_at)).length;

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <QrCode className="h-7 w-7" aria-hidden />
          </span>
          <p className="mt-4 font-semibold text-neutral-800">
            No hay actividades abiertas
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Cuando alguien escanee tu QR, el evento aparecerá acá al instante.
          </p>
        </div>
        {closedCount > 0 && (
          <ClosedActivitiesLink count={closedCount} />
        )}
      </div>
    );
  }

  const unreadCount = visibleLogs.length;

  return (
    <div className="space-y-4">
      {variant === "open" && unreadCount > 0 && (
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
        {visibleLogs.map((log, index) => {
          const isUnread = !log.read_at;
          const hasNote = Boolean(log.scanner_note?.trim());
          const isLatestUnread =
            variant === "open" &&
            isUnread &&
            index === visibleLogs.findIndex((l) => !l.read_at);
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
                        : variant === "closed"
                          ? "bg-neutral-100 text-neutral-600"
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
                      {variant === "open" ? (
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
                    {variant === "closed" && log.read_at && (
                      <p className="mt-1 text-xs text-neutral-500">
                        Cerrada el {formatDateTime(log.read_at)}
                      </p>
                    )}
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
                    <p
                      className={cn(
                        "mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold shadow-sm sm:text-sm",
                        variant === "closed"
                          ? "bg-neutral-100 text-neutral-800"
                          : "bg-violet-600 text-white shadow-violet-500/25",
                      )}
                    >
                      <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {variant === "closed"
                        ? "Ver historial del evento"
                        : "Ver chat en vivo y ubicación"}
                    </p>
                  </div>
                  <ChevronRight
                    className="mt-2 hidden h-5 w-5 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500 sm:block"
                    aria-hidden
                  />
                </Link>

                {variant === "open" && isUnread && (
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

      {variant === "open" && logs.some((log) => Boolean(log.read_at)) && (
        <ClosedActivitiesLink
          count={logs.filter((log) => Boolean(log.read_at)).length}
        />
      )}
    </div>
  );
}

function ClosedActivitiesLink({ count }: { count: number }) {
  return (
    <div className="flex justify-center pt-2">
      <Link
        href="/dashboard/actividad/cerradas"
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
      >
        <Archive className="h-4 w-4" aria-hidden />
        Ver actividades cerradas
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
          {count}
        </span>
      </Link>
    </div>
  );
}
