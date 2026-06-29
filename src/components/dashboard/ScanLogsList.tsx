"use client";

import Link from "next/link";
import { MapPin, MessageSquare, AlertTriangle, QrCode } from "lucide-react";
import type { ScanLogWithProfile } from "@/types/database";
import { alertTypeLabel, formatDateTime } from "@/lib/utils/format";

type ScanLogsListProps = {
  logs: ScanLogWithProfile[];
};

export function ScanLogsList({ logs }: ScanLogsListProps) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 px-6 py-10 text-center text-neutral-500">
        Todavía no hubo escaneos. Cuando alguien lea el QR, aparecerá acá.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {logs.map((log, index) => {
        const isUnread = !log.read_at;
        const hasNote = Boolean(log.scanner_note?.trim());
        const isLatestUnread = isUnread && index === logs.findIndex((l) => !l.read_at);

        return (
          <li key={log.id}>
            <Link
              href={`/dashboard/logs/${log.id}`}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-neutral-50 ${
                isLatestUnread
                  ? "border-violet-400 bg-violet-50/60 shadow-md ring-2 ring-violet-300/60"
                  : isUnread
                    ? "border-red-300 bg-red-50/50"
                    : "border-neutral-200 bg-white"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  log.alert_type === "sos"
                    ? "bg-red-600 text-white"
                    : "bg-violet-100 text-violet-800"
                }`}
              >
                {log.alert_type === "sos" ? (
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                ) : (
                  <QrCode className="h-4 w-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-neutral-900">
                    {log.beneficiary_name}
                  </p>
                  {isUnread && (
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      Nuevo
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-600">
                  {alertTypeLabel(log.alert_type)} · {formatDateTime(log.scanned_at)}
                </p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
                  {log.latitude != null && log.longitude != null && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden />
                      Con ubicación
                    </span>
                  )}
                  {hasNote && (
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <MessageSquare className="h-3 w-3" aria-hidden />
                      Con nota
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
