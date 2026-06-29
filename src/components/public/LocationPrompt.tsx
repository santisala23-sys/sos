"use client";

import { MapPin, Phone } from "lucide-react";
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
  const denied = status === "denied";

  return (
    <section
      className="mx-4 my-4 rounded-2xl border-4 border-amber-400 bg-amber-950 px-5 py-8 shadow-2xl"
      aria-labelledby="location-prompt-title"
      aria-describedby="location-prompt-desc"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
          <MapPin className="h-10 w-10 text-amber-300" aria-hidden />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          {denied ? "Ubicación no disponible" : "Paso recomendado"}
        </p>
        <h2
          id="location-prompt-title"
          className="mt-2 text-2xl font-black leading-tight text-amber-50 sm:text-3xl"
        >
          {denied ? "No pudimos obtener tu ubicación" : "Compartí la ubicación"}
        </h2>
        <p id="location-prompt-desc" className="mt-3 text-base leading-relaxed text-amber-100/90">
          {denied ? (
            <>
              El GPS puede estar bloqueado en este dispositivo. Igual podés ver los
              contactos de emergencia de{" "}
              <strong className="text-white">{beneficiaryName}</strong> y pedir ayuda.
            </>
          ) : (
            <>
              Ayudá a la familia de{" "}
              <strong className="text-white">{beneficiaryName}</strong> indicando dónde
              estás. Si no funciona, podés continuar igual.
            </>
          )}
        </p>

        {!denied && (
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
        )}

        {denied && (
          <div className="mt-4 w-full rounded-lg bg-red-950/80 px-4 py-3 text-sm text-red-200" role="alert">
            Revisá que el navegador tenga permiso de ubicación, o continuá sin GPS.
          </div>
        )}

        {denied && (
          <Button
            type="button"
            size="xl"
            onClick={onSkip}
            className="mt-4 w-full gap-2 bg-green-600 py-6 text-lg font-black text-white hover:bg-green-500"
          >
            <Phone className="h-6 w-6" aria-hidden />
            Ver contactos de emergencia
          </Button>
        )}

        {denied && (
          <Button
            type="button"
            variant="ghost"
            onClick={onShare}
            className="mt-3 text-amber-200 hover:bg-amber-900/50"
          >
            Intentar compartir ubicación de nuevo
          </Button>
        )}

        {!denied && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="mt-4 text-amber-100 hover:bg-amber-900/50"
          >
            Continuar sin ubicación
          </Button>
        )}
      </div>
    </section>
  );
}
