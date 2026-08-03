"use client";

import { useState } from "react";
import { Bookmark, MapPin, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LocationPromptProps = {
  beneficiaryName: string;
  status: "idle" | "loading" | "granted" | "denied" | "saving" | "saved";
  onShare: () => void;
  onSkip: () => void;
  /** Solo perfiles objeto: guardar pin sin alerta de emergencia. */
  onSave?: () => void;
  isObjectProfile?: boolean;
  isLight?: boolean;
};

export function LocationPrompt({
  beneficiaryName,
  status,
  onShare,
  onSkip,
  onSave,
  isObjectProfile = false,
  isLight = false,
}: LocationPromptProps) {
  const denied = status === "denied";
  const busy = status === "loading" || status === "saving";
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  function handleConfirmSkip() {
    setShowSkipConfirm(false);
    onSkip();
  }

  return (
    <>
    <section
      className={`mx-4 my-4 rounded-2xl border-4 px-5 py-8 shadow-2xl ${
        isLight
          ? "border-amber-300 bg-amber-50 shadow-amber-500/15"
          : "border-amber-400 bg-amber-950 shadow-black/30"
      }`}
      aria-labelledby="location-prompt-title"
      aria-describedby="location-prompt-desc"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            isLight ? "bg-amber-200/60" : "bg-amber-500/20"
          }`}
        >
          <MapPin
            className={`h-10 w-10 ${isLight ? "text-amber-600" : "text-amber-300"}`}
            aria-hidden
          />
        </div>
        <p
          className={`text-xs font-bold uppercase tracking-widest ${
            isLight ? "text-amber-700" : "text-amber-300"
          }`}
        >
          {denied
            ? "Ubicación no disponible"
            : isObjectProfile
              ? "Objeto con QR"
              : "Gracias por ayudar"}
        </p>
        <h2
          id="location-prompt-title"
          className={`mt-2 text-2xl font-black leading-tight sm:text-3xl ${
            isLight ? "text-amber-950" : "text-amber-50"
          }`}
        >
          {denied
            ? "No pudimos obtener tu ubicación"
            : isObjectProfile
              ? "¿Dónde lo dejaste?"
              : "Compartí la ubicación"}
        </h2>
        <p
          id="location-prompt-desc"
          className={`mt-3 text-base leading-relaxed ${
            isLight ? "text-amber-900/90" : "text-amber-100/90"
          }`}
        >
          {denied ? (
            <>
              El GPS puede estar bloqueado en este dispositivo. Igual podés ver los
              contactos de{" "}
              <strong className={isLight ? "text-amber-950" : "text-white"}>
                {beneficiaryName}
              </strong>
              .
            </>
          ) : isObjectProfile ? (
            <>
              Guardá la ubicación de{" "}
              <strong className={isLight ? "text-amber-950" : "text-white"}>
                {beneficiaryName}
              </strong>{" "}
              para encontrarlo después (auto, valija, etc.). Si lo encontraste
              perdido, también podés avisar al dueño.
            </>
          ) : (
            <>
              Ayudá a la familia de{" "}
              <strong className={isLight ? "text-amber-950" : "text-white"}>
                {beneficiaryName}
              </strong>{" "}
              indicando dónde estás. Si no funciona, podés continuar igual.
            </>
          )}
        </p>

        {!denied && isObjectProfile && onSave && (
          <Button
            type="button"
            size="xl"
            disabled={busy}
            onClick={onSave}
            className="mt-6 w-full gap-2 bg-sky-500 py-6 text-lg font-black text-white hover:bg-sky-400"
          >
            <Bookmark className="h-6 w-6" aria-hidden />
            {status === "saving" ? "Guardando..." : "Guardar ubicación"}
          </Button>
        )}

        {!denied && (
          <Button
            type="button"
            size="xl"
            disabled={busy}
            onClick={onShare}
            className={`w-full gap-2 py-6 text-lg font-black ${
              isObjectProfile
                ? "mt-3 bg-amber-500 text-black hover:bg-amber-400"
                : "mt-6 bg-amber-500 text-black hover:bg-amber-400"
            }`}
          >
            <MapPin className="h-6 w-6" aria-hidden />
            {status === "loading"
              ? "Obteniendo GPS..."
              : isObjectProfile
                ? "Avisar al dueño con mi ubicación"
                : "Compartir mi ubicación"}
          </Button>
        )}

        {!denied && (
          <p
            className={`mt-3 text-xs leading-relaxed ${
              isLight ? "text-amber-800/90" : "text-amber-200/90"
            }`}
          >
            {isObjectProfile ? (
              <>
                Guardar ubicación solo actualiza el pin del objeto (sin alerta).
                Avisar al dueño sí le manda una notificación.{" "}
              </>
            ) : (
              <>
                Al compartir, enviamos tu ubicación GPS al tutor responsable para
                ayudar en la asistencia. Podés continuar sin ubicación.{" "}
              </>
            )}
            <a
              href="/privacidad"
              className="underline underline-offset-2 hover:text-white"
            >
              Privacidad
            </a>
          </p>
        )}

        {denied && (
          <div
            className={`mt-4 w-full rounded-lg px-4 py-3 text-sm ${
              isLight ? "bg-red-100 text-red-800" : "bg-red-950/80 text-red-200"
            }`}
            role="alert"
          >
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
            Ver contactos
          </Button>
        )}

        {denied && (
          <Button
            type="button"
            variant="ghost"
            onClick={onShare}
            className={
              isLight
                ? "mt-3 text-amber-800 hover:bg-amber-100"
                : "mt-3 text-amber-200 hover:bg-amber-900/50"
            }
          >
            Intentar con GPS de nuevo
          </Button>
        )}

        {!denied && (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setShowSkipConfirm(true)}
            className={`mt-4 w-full border-2 py-4 text-base font-bold ${
              isLight
                ? "border-amber-400 bg-white text-amber-950 hover:bg-amber-100"
                : "border-amber-300/90 bg-white/15 text-amber-50 hover:bg-white/25"
            }`}
          >
            Continuar sin ubicación
          </Button>
        )}
      </div>
    </section>

    {showSkipConfirm && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="skip-location-title"
        aria-describedby="skip-location-desc"
      >
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <h3
              id="skip-location-title"
              className="text-xl font-black text-neutral-900"
            >
              ¿Estás seguro?
            </h3>
            <button
              type="button"
              onClick={() => setShowSkipConfirm(false)}
              aria-label="Cerrar"
              className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p
            id="skip-location-desc"
            className="mt-3 text-sm leading-relaxed text-neutral-600"
          >
            Vas a continuar sin compartir ubicación por ahora. Igual vas a poder
            compartirla más adelante desde esta pantalla.
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setShowSkipConfirm(false)}
            >
              Volver
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleConfirmSkip}
            >
              Sí, continuar sin ubicación
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
