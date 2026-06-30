"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

type LegalAcceptanceBannerProps = {
  currentVersion: string;
  userVersion: string | null;
  onAccepted: () => void;
};

export function LegalAcceptanceBanner({
  currentVersion,
  userVersion,
  onAccepted,
}: LegalAcceptanceBannerProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdate = Boolean(userVersion);

  async function handleAccept() {
    if (!accepted) {
      setError("Marcá la casilla para continuar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/accept-legal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptedTerms: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar");
        return;
      }

      onAccepted();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="rounded-2xl border-2 border-violet-300 bg-violet-50 p-5 shadow-sm"
      aria-labelledby="legal-banner-title"
    >
      <div className="flex gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="legal-banner-title" className="font-bold text-violet-950">
            {isUpdate
              ? "Actualizamos nuestros Términos y Política de Privacidad"
              : "Confirmá los Términos para seguir usando SOSme"}
          </h2>
          <p className="mt-1 text-sm text-violet-900/90">
            {isUpdate ? (
              <>
                Hay una versión nueva (v{currentVersion}). Revisá los cambios y aceptá
                para continuar gestionando tus perfiles.
              </>
            ) : (
              <>
                Para usar el panel necesitás aceptar los documentos legales vigentes
                (v{currentVersion}).
              </>
            )}
          </p>

          <label className="mt-4 flex items-start gap-3 text-sm text-violet-950">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
            />
            <span>
              Acepto los{" "}
              <Link href="/terminos" className="font-semibold underline-offset-2 hover:underline" target="_blank">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="font-semibold underline-offset-2 hover:underline" target="_blank">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            disabled={loading}
            onClick={handleAccept}
            className="mt-4"
          >
            {loading ? "Guardando..." : "Aceptar y continuar"}
          </Button>
        </div>
      </div>
    </section>
  );
}
