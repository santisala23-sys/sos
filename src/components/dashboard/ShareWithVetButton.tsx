"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";
import { Check, Copy, Link2, Loader2, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils/format";

type ShareWithVetButtonProps = {
  petId: string;
  petName: string;
  className?: string;
  label?: string;
};

export function ShareWithVetButton({
  petId,
  petName,
  className,
  label = "Compartir con veterinario",
}: ShareWithVetButtonProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  async function generateLink() {
    setLoading(true);
    setError(null);
    setUrl(null);
    setExpiresAt(null);
    setCopied(false);

    try {
      const res = await fetch(`/api/qr-profiles/${petId}/vet-token`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        error?: string;
        url?: string;
        expires_at?: string;
      };

      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo generar el enlace");
        setOpen(true);
        return;
      }

      setUrl(data.url);
      setExpiresAt(data.expires_at ?? null);
      setOpen(true);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar. Copiá el enlace manualmente.");
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => void generateLink()}
        disabled={loading}
        className={`gap-2 ${className ?? ""}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Stethoscope className="h-4 w-4" aria-hidden />
        )}
        {label}
      </Button>

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:items-center"
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-vet-title"
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
                    <h2 id="share-vet-title" className="text-xl font-black">
                      Compartir con veterinario
                    </h2>
                    <p className="mt-1 text-sm text-violet-100">
                      Acceso temporal a la libreta de {petName}
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

                <div className="space-y-5 px-6 py-5">
                  {error && (
                    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                      {error}
                    </p>
                  )}

                  {url && (
                    <>
                      <div className="flex justify-center">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                          <QRCode value={url} size={180} level="M" />
                        </div>
                      </div>

                      <p className="text-center text-sm text-neutral-600">
                        El veterinario puede escanear este QR o abrir el enlace.
                        <span className="mt-1 block font-semibold text-amber-700">
                          Válido por 24 horas
                          {expiresAt
                            ? ` (hasta ${formatDateTime(expiresAt)})`
                            : ""}
                          .
                        </span>
                      </p>

                      <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                        <Link2
                          className="h-4 w-4 shrink-0 text-neutral-400"
                          aria-hidden
                        />
                        <p className="min-w-0 flex-1 break-all font-mono text-xs text-neutral-700">
                          {url}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void copyLink()}
                        className="w-full gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" aria-hidden />
                            Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" aria-hidden />
                            Copiar enlace
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
