"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getPublicProfileUrl } from "@/lib/utils/slug";

type QrCodeDisplayProps = {
  slug: string;
  beneficiaryName: string;
};

function getQrSvg(container: HTMLDivElement | null): SVGSVGElement | null {
  return container?.querySelector("svg") ?? null;
}

function svgToPngDataUrl(svg: SVGSVGElement, size = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas no disponible"));
      return;
    }

    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo renderizar el QR"));
    };
    img.src = url;
  });
}

export function QrCodeDisplay({ slug, beneficiaryName }: QrCodeDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const publicUrl = getPublicProfileUrl(slug);

  async function downloadPng() {
    const svg = getQrSvg(containerRef.current);
    if (!svg) return;

    try {
      const dataUrl = await svgToPngDataUrl(svg);
      const link = document.createElement("a");
      link.download = `sos-qr-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // ignore
    }
  }

  async function printOrPdf() {
    const svg = getQrSvg(containerRef.current);
    if (!svg) return;

    try {
      const dataUrl = await svgToPngDataUrl(svg, 800);
      const safeName = beneficiaryName.replace(/</g, "&lt;");
      const safeUrl = publicUrl.replace(/</g, "&lt;");
      const win = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
      if (!win) return;

      win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>SOSme — QR ${safeName}</title>
  <style>
    @page { margin: 12mm; size: A4; }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      color: #171717;
      margin: 0;
      padding: 24px;
      text-align: center;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .brand { font-size: 13px; color: #6d28d9; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
    .sub { color: #525252; font-size: 14px; margin: 0 0 20px; }
    .qr {
      display: inline-block;
      padding: 16px;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      background: #fff;
    }
    .qr img { display: block; width: 280px; height: 280px; }
    .url { margin-top: 16px; font-size: 12px; word-break: break-all; color: #737373; }
    .hint { margin-top: 28px; font-size: 12px; color: #a3a3a3; }
    @media print {
      .hint { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <p class="brand">SOSme</p>
  <h1>${safeName}</h1>
  <p class="sub">Escaneá este código para ver el perfil de emergencia</p>
  <div class="qr"><img src="${dataUrl}" alt="Código QR" /></div>
  <p class="url">${safeUrl}</p>
  <p class="hint">Usá «Guardar como PDF» o imprimí esta página. Podés cerrar la ventana después.</p>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 250);
    };
  </script>
</body>
</html>`);
      win.document.close();
    } catch {
      // ignore
    }
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
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          onClick={downloadPng}
          className="gap-2"
        >
          <Download className="h-4 w-4" aria-hidden />
          Descargar PNG
        </Button>
        <Button
          type="button"
          onClick={printOrPdf}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          Imprimir / PDF
        </Button>
      </div>
    </div>
  );
}
