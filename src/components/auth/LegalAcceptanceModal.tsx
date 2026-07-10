"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type LegalAcceptanceModalProps = {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
};

export function LegalAcceptanceModal({
  open,
  onAccept,
  onCancel,
}: LegalAcceptanceModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onCancel}
      />
      <div className="relative my-auto flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-500/20">
        <div className="shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-5 text-white">
          <h2 id="legal-modal-title" className="text-xl font-black">
            Confirmaciones finales
          </h2>
          <p className="mt-1 text-sm text-violet-100">
            Para continuar con Google necesitamos tu confirmación.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-neutral-700">
          <p>
            Declaro ser <strong>mayor de 18 años</strong> y contar con legitimación
            para usar SOSme como tutor responsable (titular, padre/madre/tutor legal,
            dueño o responsable del beneficiario al cargar datos de terceros,
            incluidos menores).
          </p>
          <p>
            Acepto los{" "}
            <Link
              href="/terminos"
              target="_blank"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link
              href="/privacidad"
              target="_blank"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Política de Privacidad
            </Link>{" "}
            de SOSme.
          </p>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-neutral-100 px-6 py-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onAccept}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            Acepto y continuar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function LegalCheckbox({
  checked,
  onChange,
  highlight,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3 text-sm text-neutral-700 transition-all duration-500",
        highlight && "border-violet-400 bg-violet-50 shadow-md shadow-violet-500/15",
        !highlight && "border-transparent",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-violet-600 transition-transform duration-300 focus:ring-violet-500",
          highlight && "scale-110",
        )}
      />
      <span>{children}</span>
    </label>
  );
}
