"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LocationPromptProps = {
  beneficiaryName: string;
  status: "idle" | "loading" | "granted" | "denied";
  onShare: () => void;
  onSkip: () => void;
};

export function LocationPrompt({
  beneficiaryName,
  status,
  onShare,
  onSkip,
}: LocationPromptProps) {
  return (
    <section
      className="mx-4 my-4 rounded-2xl border-4 border-amber-400 bg-amber-950 px-5 py-8 shadow-2xl"
      role="alertdialog"
      aria-labelledby="location-prompt-title"
      aria-describedby="location-prompt-desc"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
          <MapPin className="h-10 w-10 text-amber-300" aria-hidden />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Paso necesario
        </p>
        <h2
          id="location-prompt-title"
          className="mt-2 text-2xl font-black leading-tight text-amber-50 sm:text-3xl"
        >
          Compartí la ubicación
        </h2>
        <p id="location-prompt-desc" className="mt-3 text-base leading-relaxed text-amber-100/90">
          Antes de ver los contactos de emergencia de{" "}
          <strong className="text-white">{beneficiaryName}</strong>, indicá dónde
          estás. La familia recibe el aviso con tu posición en el mapa.
        </p>

        <Button
          type="button"
          size="xl"
          disabled={status === "loading"}
          onClick={onShare}
          className="mt-6 w-full gap-2 bg-amber-500 py-6 text-lg font-black text-black hover:bg-amber-400"
        >
          <MapPin className="h-6 w-6" aria-hidden />
          {status === "loading" ? "Obteniendo GPS..." : "Compartir mi ubicación"}
        </Button>

        {status === "denied" && (
          <p className="mt-4 rounded-lg bg-red-950/80 px-4 py-3 text-sm text-red-200" role="alert">
            No pudimos obtener la ubicación. Revisá los permisos del navegador o
            tocá de nuevo el botón.
          </p>
        )}

        <button
          type="button"
          onClick={onSkip}
          className="mt-5 text-sm text-amber-300/80 underline-offset-2 hover:text-amber-100 hover:underline"
        >
          Continuar sin ubicación
        </button>
      </div>
    </section>
  );
}
