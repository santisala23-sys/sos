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
      className="group flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-red-300/80 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 p-5 shadow-lg shadow-red-500/15 transition-all hover:border-red-400 hover:shadow-xl hover:shadow-red-500/20"
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-500/40">
        <Bell className="h-5 w-5" aria-hidden />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-red-600 shadow">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      </span>
      <div className="flex-1">
        <p className="text-lg font-bold text-red-950">
          {unreadCount === 1
            ? "Tenés 1 alerta nueva"
            : `Tenés ${unreadCount} alertas nuevas`}
        </p>
        <p className="mt-0.5 text-sm text-red-800/90">
          Escaneo, SOS o nota pendiente de revisar — tocá para ver el detalle
        </p>
      </div>
      <ChevronRight
        className="h-5 w-5 shrink-0 text-red-400 transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}
