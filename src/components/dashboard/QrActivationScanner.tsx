"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { X } from "lucide-react";
import { normalizeActivationCode } from "@/lib/activation/codes";

type QrActivationScannerProps = {
  onClose: () => void;
};

// Extrae el código de activación de lo que devuelve el QR. Acepta una URL
// completa (https://.../activar/CODIGO), una ruta (/activar/CODIGO) o el código
// pelado.
function extractActivationCode(text: string): string | null {
  const trimmed = text.trim();

  const pathFromUrl = (() => {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return trimmed;
    }
  })();

  const match = pathFromUrl.match(/\/activar\/([^/?#]+)/i);
  if (match?.[1]) {
    const code = normalizeActivationCode(decodeURIComponent(match[1]));
    return code || null;
  }

  const normalized = normalizeActivationCode(trimmed);
  return normalized || null;
}

export function QrActivationScanner({ onClose }: QrActivationScannerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const handledRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este dispositivo no permite abrir la cámara.");
      return;
    }

    const canvas = canvasRef.current ?? document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function scanFrame() {
      const video = videoRef.current;
      if (cancelled || handledRef.current || !video || !ctx) {
        if (!cancelled && !handledRef.current) {
          rafRef.current = requestAnimationFrame(scanFrame);
        }
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const maxDim = 640;
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 480;
        const scale = Math.min(1, maxDim / Math.max(vw, vh));
        const w = Math.round(vw * scale);
        const h = Math.round(vh * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(video, 0, 0, w, h);

        const imageData = ctx.getImageData(0, 0, w, h);
        const result = jsQR(imageData.data, w, h, {
          inversionAttempts: "dontInvert",
        });

        if (result?.data) {
          const code = extractActivationCode(result.data);
          if (code) {
            handledRef.current = true;
            router.push(`/activar/${code}`);
            return;
          }
        }
      }

      rafRef.current = requestAnimationFrame(scanFrame);
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
        rafRef.current = requestAnimationFrame(scanFrame);
      } catch {
        if (!cancelled) setError("No se pudo acceder a la cámara.");
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Escanear QR"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold">Escaneá tu QR SOSme</span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={videoRef}
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {!error && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-64 w-64 max-w-[70vw] rounded-3xl">
              <span className="absolute -left-1 -top-1 h-10 w-10 rounded-tl-3xl border-l-4 border-t-4 border-white" />
              <span className="absolute -right-1 -top-1 h-10 w-10 rounded-tr-3xl border-r-4 border-t-4 border-white" />
              <span className="absolute -bottom-1 -left-1 h-10 w-10 rounded-bl-3xl border-b-4 border-l-4 border-white" />
              <span className="absolute -bottom-1 -right-1 h-10 w-10 rounded-br-3xl border-b-4 border-r-4 border-white" />
            </div>
          </div>
        )}

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>

      <div className="px-6 py-6 text-center">
        {error ? (
          <p className="text-sm font-medium text-red-300" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-sm text-white/80">
            Apuntá la cámara al código QR de tu colgante, collar o sticker.
          </p>
        )}
      </div>
    </div>
  );
}
