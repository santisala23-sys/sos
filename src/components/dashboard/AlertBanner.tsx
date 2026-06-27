"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";

type AlertBannerProps = {
  unreadCount: number;
  latestLogId?: string;
};

export function AlertBanner({ unreadCount, latestLogId }: AlertBannerProps) {
  if (unreadCount === 0) return null;

  const href = latestLogId
    ? `/dashboard/logs/${latestLogId}`
    : "/dashboard#actividad";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-4 text-red-900 transition-colors hover:bg-red-100"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
        <Bell className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex-1">
        <p className="font-bold">
          {unreadCount === 1
            ? "Tenés 1 alerta nueva"
            : `Tenés ${unreadCount} alertas nuevas`}
        </p>
        <p className="text-sm text-red-800/80">
          Escaneo, SOS o nota pendiente de revisar — tocá para ver
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
    </Link>
  );
}
