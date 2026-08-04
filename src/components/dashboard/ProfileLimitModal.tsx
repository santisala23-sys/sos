"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ProfileLimitModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileLimitModal({ open, onClose }: ProfileLimitModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-limit-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-white shadow-2xl shadow-red-500/20">
        <div className="bg-gradient-to-br from-red-600 to-red-700 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <AlertTriangle className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 id="profile-limit-title" className="text-lg font-black">
                  Límite alcanzado
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-red-100">
                  Llegaste al límite de perfiles de tu plan. Mejorá tu plan para
                  crear más perfiles.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-red-100 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="px-5 py-4">
          <Link href="/contacto" onClick={onClose}>
            <Button type="button" className="w-full bg-red-600 hover:bg-red-700">
              Contactanos
            </Button>
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
