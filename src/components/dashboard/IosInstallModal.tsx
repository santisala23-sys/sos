"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlusSquare, Share, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type IosInstallModalProps = {
  open: boolean;
  onClose: () => void;
};

const STEPS = [
  {
    icon: Share,
    title: "Tocá Compartir",
    body: "En Safari, abajo en el centro, tocá el ícono de compartir (cuadrado con flecha hacia arriba).",
  },
  {
    icon: PlusSquare,
    title: "Agregar a pantalla de inicio",
    body: "Deslizá las opciones si hace falta y elegí “Agregar a pantalla de inicio”.",
  },
  {
    icon: Smartphone,
    title: "Abrí SOSme desde el ícono",
    body: "Confirmá con “Agregar”. Después abrí la app desde el ícono violeta en tu inicio y activá las alertas push.",
  },
] as const;

export function IosInstallModal({ open, onClose }: IosInstallModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-violet-100 bg-white shadow-2xl shadow-violet-500/20">
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-violet-100 bg-gradient-to-br from-violet-600 to-indigo-600 px-5 py-4 text-white">
          <div>
            <h2 id="ios-install-title" className="text-lg font-black">
              Agregar SOSme al inicio
            </h2>
            <p className="mt-1 text-sm text-violet-100">
              En iPhone no podemos hacerlo con un botón: Safari lo pide manualmente.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-violet-100 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ol className="space-y-4 px-5 py-5">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-black text-white">
                {index + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-violet-700" aria-hidden />
                  <p className="font-bold text-neutral-900">{step.title}</p>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="border-t border-neutral-100 px-5 py-4">
          <Button type="button" className="w-full" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
