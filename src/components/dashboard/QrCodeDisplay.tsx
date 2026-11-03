"use client";

import { useRef } from "react";
import QRCode from "react-qr-code";
import { Download, FileDown, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  buildOfflineQrText,
  type OfflineQrInput,
} from "@/lib/qr/offline-payload";
import { getPublicProfileUrl } from "@/lib/utils/slug";

type QrCodeDisplayProps = {
  slug: string;
  beneficiaryName: string;
  offline: OfflineQrInput;
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export function QrCodeDisplay({
  slug,
  beneficiaryName,
  offline,
}: QrCodeDisplayProps) {
  const onlineRef = useRef<HTMLDivElement>(null);
  const offlineRef = useRef<HTMLDivElement>(null);
  const publicUrl = getPublicProfileUrl(slug);
  const offlineText = buildOfflineQrText({
    ...offline,
    beneficiaryName: offline.beneficiaryName || beneficiaryName,
  });
  const hasPhone = Boolean(offline.emergencyContactPhone?.trim());

  async function downloadPng() {
    const svg = getQrSvg(onlineRef.current);
    if (!svg) return;

    try {
      const dataUrl = await svgToPngDataUrl(svg);
      downloadDataUrl(dataUrl, `sos-qr-${slug}.png`);
    } catch {
      // ignore
    }
  }

  async function downloadOfflinePng() {
    const svg = getQrSvg(offlineRef.current);
    if (!svg) return;

    try {
      const dataUrl = await svgToPngDataUrl(svg);
      downloadDataUrl(dataUrl, `sos-qr-sin-conexion-${slug}.png`);
    } catch {
      // ignore
    }
  }

  async function printOrPdf() {
    const onlineSvg = getQrSvg(onlineRef.current);
    const offlineSvg = getQrSvg(offlineRef.current);
    if (!onlineSvg || !offlineSvg) return;

    try {
      const [onlineUrl, offlineUrl] = await Promise.all([
        svgToPngDataUrl(onlineSvg, 800),
        svgToPngDataUrl(offlineSvg, 800),
      ]);
      const safeName = escapeHtml(beneficiaryName);
      const safeUrl = escapeHtml(publicUrl);
      const safeOffline = escapeHtml(offlineText);
      const win = window.open("", "_blank", "noopener,noreferrer,width=840,height=960");
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
    }
    h1 { font-size: 22px; margin: 0 0 4px; text-align: center; }
    .brand { font-size: 13px; color: #6d28d9; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; text-align: center; }
    .sub { color: #525252; font-size: 14px; margin: 0 0 20px; text-align: center; }
    .grid { display: flex; gap: 24px; justify-content: center; align-items: flex-start; }
    .card { width: 300px; text-align: center; }
    .label { font-size: 13px; font-weight: 700; margin: 0 0 8px; }
    .qr {
      display: inline-block;
      padding: 12px;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      background: #fff;
    }
    .qr img { display: block; width: 240px; height: 240px; }
    .url, .note { margin-top: 10px; font-size: 12px; word-break: break-all; color: #525252; }
    .plain {
      margin: 28px auto 0;
      max-width: 560px;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 16px 18px;
    }
    .plain h2 { font-size: 14px; margin: 0 0 8px; }
    .plain pre {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 14px;
      white-space: pre-wrap;
      line-height: 1.45;
    }
    .hint { margin-top: 20px; font-size: 12px; color: #a3a3a3; text-align: center; }
    @media print {
      .hint { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <p class="brand">SOSme</p>
  <h1>${safeName}</h1>
  <p class="sub">Dos códigos: la página completa, y los datos imprescindibles si no hay internet</p>
  <div class="grid">
    <div class="card">
      <p class="label">Con internet</p>
      <div class="qr"><img src="${onlineUrl}" alt="QR del perfil" /></div>
      <p class="url">${safeUrl}</p>
      <p class="note">Abre el perfil, avisa al tutor y permite ubicación y chat.</p>
    </div>
    <div class="card">
      <p class="label">Sin internet</p>
      <div class="qr"><img src="${offlineUrl}" alt="QR sin conexión" /></div>
      <p class="note">El celular muestra el texto sin abrir una página. Sirve para llamar. No avisa al tutor.</p>
    </div>
  </div>
  <div class="plain">
    <h2>Texto del código sin internet</h2>
    <pre>${safeOffline}</pre>
  </div>
  <p class="hint">Usá «Guardar como PDF» o imprimí esta página. Si cambiás un teléfono o un dato de salud, volvé a imprimir el código sin conexión.</p>
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
    <div className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6">
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
          Con internet
        </p>
        <div
          ref={onlineRef}
          className="rounded-lg bg-white p-3"
          aria-label={`Código QR del perfil de ${beneficiaryName}`}
        >
          <QRCode value={publicUrl} size={200} level="H" />
        </div>
        <p className="max-w-xs break-all text-center text-xs text-neutral-500">
          {publicUrl}
        </p>
        <p className="max-w-sm text-center text-sm text-neutral-600">
          Abre el perfil, avisa al tutor y permite ubicación y chat.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 border-t border-neutral-100 pt-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-neutral-500">
          <WifiOff className="h-3.5 w-3.5" aria-hidden />
          Sin internet
        </p>
        <div
          ref={offlineRef}
          className="rounded-lg bg-white p-3"
          aria-label={`Código QR sin conexión de ${beneficiaryName}`}
        >
          <QRCode value={offlineText} size={200} level="M" />
        </div>
        <p className="max-w-sm text-center text-sm text-neutral-600">
          El celular muestra este texto sin abrir una página. Con señal de
          llamada se puede marcar el número. No avisa al tutor ni comparte
          ubicación.
        </p>
        <pre className="w-full max-w-sm whitespace-pre-wrap rounded-lg bg-neutral-50 px-3 py-2 text-left font-mono text-xs leading-relaxed text-neutral-800">
          {offlineText}
        </pre>
        {!hasPhone && (
          <p className="max-w-sm text-center text-sm text-amber-800">
            Cargá un teléfono de emergencia para que este código sirva para
            llamar.
          </p>
        )}
        <p className="max-w-sm text-center text-xs leading-relaxed text-neutral-500">
          El QR de fábrica de la chapita o el sticker no cambia: sigue abriendo
          la página y necesita internet. Imprimí este código y llevalo junto
          (etiqueta, credencial, casco o cartera). Si cambiás un teléfono o un
          dato de salud, volvé a imprimirlo. El número queda visible en este
          código.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
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
          variant="secondary"
          onClick={downloadOfflinePng}
          className="gap-2"
        >
          <WifiOff className="h-4 w-4" aria-hidden />
          PNG sin conexión
        </Button>
        <Button type="button" onClick={printOrPdf} className="gap-2">
          <FileDown className="h-4 w-4" aria-hidden />
          Imprimir / PDF
        </Button>
      </div>
    </div>
  );
}
