"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPublicProfileUrl } from "@/lib/utils/slug";

type QrCodeDisplayProps = {
  slug: string;
  beneficiaryName: string;
};

export function QrCodeDisplay({ slug, beneficiaryName }: QrCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const publicUrl = getPublicProfileUrl(slug);

  async function downloadPng() {
    const svg = containerRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `sos-qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white p-6">
      <div
        ref={containerRef}
        className="rounded-lg bg-white p-4"
        aria-label={`Código QR para ${beneficiaryName}`}
      >
        <QRCode value={publicUrl} size={200} level="H" />
      </div>
      <p className="max-w-xs break-all text-center text-xs text-neutral-500">
        {publicUrl}
      </p>
      <Button
        type="button"
        variant="secondary"
        onClick={downloadPng}
        className="gap-2"
      >
        <Download className="h-4 w-4" aria-hidden />
        Descargar QR (PNG)
      </Button>
    </div>
  );
}
