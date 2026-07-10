"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

type AvatarCropperProps = {
  file: File;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
};

const VIEW = 288; // tamaño del área de recorte en pantalla (px)
const OUT = 512; // tamaño exportado (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function AvatarCropper({ file, onCancel, onConfirm }: AvatarCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [ready, setReady] = useState(false);

  const baseScale = useCallback((img: HTMLImageElement) => {
    return VIEW / Math.min(img.width, img.height);
  }, []);

  const clamp = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const s = baseScale(img) * zoomRef.current;
    const drawW = img.width * s;
    const drawH = img.height * s;
    const maxX = Math.max(0, (drawW - VIEW) / 2);
    const maxY = Math.max(0, (drawH - VIEW) / 2);
    posRef.current.x = Math.max(-maxX, Math.min(maxX, posRef.current.x));
    posRef.current.y = Math.max(-maxY, Math.min(maxY, posRef.current.y));
  }, [baseScale]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    clamp();
    const s = baseScale(img) * zoomRef.current;
    const drawW = img.width * s;
    const drawH = img.height * s;
    ctx.clearRect(0, 0, VIEW, VIEW);
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, VIEW, VIEW);
    ctx.drawImage(
      img,
      VIEW / 2 - drawW / 2 + posRef.current.x,
      VIEW / 2 - drawH / 2 + posRef.current.y,
      drawW,
      drawH,
    );
  }, [baseScale, clamp]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      posRef.current = { x: 0, y: 0 };
      zoomRef.current = 1;
      setZoom(1);
      setReady(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (ready) draw();
  }, [ready, zoom, draw]);

  function applyZoom(next: number) {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
    zoomRef.current = clamped;
    setZoom(clamped);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current) return;
    posRef.current = {
      x: e.clientX - dragRef.current.x,
      y: e.clientY - dragRef.current.y,
    };
    draw();
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    applyZoom(zoomRef.current - e.deltaY * 0.002);
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img) return;
    const out = document.createElement("canvas");
    out.width = OUT;
    out.height = OUT;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    const f = OUT / VIEW;
    const s = baseScale(img) * zoomRef.current * f;
    const drawW = img.width * s;
    const drawH = img.height * s;
    ctx.drawImage(
      img,
      OUT / 2 - drawW / 2 + posRef.current.x * f,
      OUT / 2 - drawH / 2 + posRef.current.y * f,
      drawW,
      drawH,
    );
    onConfirm(out.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Ajustar foto de perfil"
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-900">Ajustá la foto</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar"
            className="text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Arrastrá para mover y usá el zoom para encuadrar.
        </p>

        <div className="mt-4 flex justify-center">
          <div
            className="relative overflow-hidden rounded-lg"
            style={{ width: VIEW, height: VIEW }}
          >
            <canvas
              ref={canvasRef}
              width={VIEW}
              height={VIEW}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
              className="cursor-move touch-none select-none"
              style={{ width: VIEW, height: VIEW }}
            />
            {/* Máscara circular: oscurece fuera del círculo */}
            <div
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,.85)",
                background:
                  "radial-gradient(circle at center, transparent 0, transparent calc(50% - 1px), rgba(17,24,39,.55) 50%)",
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => applyZoom(zoomRef.current - 0.25)}
            aria-label="Alejar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-violet-600"
            aria-label="Zoom"
          />
          <button
            type="button"
            onClick={() => applyZoom(zoomRef.current + 0.25)}
            aria-label="Acercar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!ready}>
            Usar esta foto
          </Button>
        </div>
      </div>
    </div>
  );
}
