"use client";

import Link from "next/link";
import {
  MapPin,
  MessageSquare,
  AlertTriangle,
  QrCode,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type ScanLogsListProps = {
  logs: ScanLogWithProfile[];
};

export function ScanLogsList({ logs }: ScanLogsListProps) {
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

  return (
    <ul className="flex flex-col gap-4">
      {logs.map((log, index) => {
        const isUnread = !log.read_at;
        const hasNote = Boolean(log.scanner_note?.trim());
        const isLatestUnread =
          isUnread && index === logs.findIndex((l) => !l.read_at);
        const isSos = log.alert_type === "sos";

        return (
          <li key={log.id}>
            <Link
              href={`/dashboard/logs/${log.id}`}
              className={cn(
                "group flex items-start gap-4 rounded-[1.25rem] border p-4 transition-all duration-200 sm:p-5",
                isLatestUnread
                  ? "border-red-300 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 shadow-lg shadow-red-500/15 ring-2 ring-red-200/80"
                  : isUnread
                    ? "border-red-200/90 bg-red-50/70 hover:border-red-300 hover:shadow-md hover:shadow-red-500/10"
                    : "border-neutral-200/80 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10",
              )}
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
                  {isUnread && (
                    <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                      Nuevo
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
                  Para chatear en vivo y ver la ubicación, tocá acá
                </p>
              </div>
              <ChevronRight
                className="mt-2 h-5 w-5 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500"
                aria-hidden
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
