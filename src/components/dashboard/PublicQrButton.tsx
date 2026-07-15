"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QrCode, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QrCodeDisplay } from "@/components/dashboard/QrCodeDisplay";

type PublicQrButtonProps = {
  slug: string;
  beneficiaryName: string;
  className?: string;
};

export function PublicQrButton({
  slug,
  beneficiaryName,
  className,
}: PublicQrButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        className={`gap-2 ${className ?? ""}`}
      >
        <QrCode className="h-4 w-4" aria-hidden />
        Ver QR público
      </Button>

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:items-center"
              role="dialog"
              aria-modal="true"
              aria-labelledby="public-qr-title"
            >
              <button
                type="button"
                className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              />
              <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-500/20">
                <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-5 text-white">
                  <div>
                    <h2 id="public-qr-title" className="text-xl font-black">
                      QR público
                    </h2>
                    <p className="mt-1 text-sm text-violet-100">
                      Perfil de emergencia de {beneficiaryName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  <QrCodeDisplay
                    slug={slug}
                    beneficiaryName={beneficiaryName}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
