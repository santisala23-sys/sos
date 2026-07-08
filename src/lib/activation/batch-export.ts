import QRCode from "qrcode";
import JSZip from "jszip";
import { getActivationUrl } from "@/lib/activation/codes";
import type { QrActivationRow } from "@/lib/db/queries-activation";
import { getAppHostname } from "@/lib/utils/app-url";

export type ExportTemplateKey =
  | "llavero"
  | "credencial"
  | "valija"
  | "sticker"
  | "minimal";

export type ExportTemplate = {
  label: string;
  width: number;
  height: number;
  brand?: boolean;
  lines: string[];
  /** Show app hostname (from NEXT_PUBLIC_APP_URL) below the text lines. */
  domainFooter?: boolean;
  qrSize: number;
  qrY: number;
};

export const EXPORT_TEMPLATES: Record<ExportTemplateKey, ExportTemplate> = {
  llavero: {
    label: "Llavero",
    width: 500,
    height: 300,
    lines: ["SCAN ME IF YOU FIND ME"],
    domainFooter: true,
    qrSize: 170,
    qrY: 85,
  },
  credencial: {
    label: "Credencial",
    width: 856,
    height: 540,
    brand: true,
    lines: ["EMERGENCIA", "Escaneá para contactar"],
    domainFooter: true,
    qrSize: 260,
    qrY: 175,
  },
  valija: {
    label: "Tarjeta valija/mochila",
    width: 700,
    height: 400,
    brand: true,
    lines: ["IF FOUND · SCAN ME"],
    domainFooter: true,
    qrSize: 210,
    qrY: 110,
  },
  sticker: {
    label: "Sticker",
    width: 500,
    height: 500,
    brand: true,
    lines: [],
    domainFooter: true,
    qrSize: 300,
    qrY: 120,
  },
  minimal: {
    label: "Solo QR",
    width: 400,
    height: 400,
    lines: [],
    domainFooter: false,
    qrSize: 340,
    qrY: 30,
  },
};

export type BatchExportMeta = {
  id: string;
  partner_name: string;
  product_label: string | null;
  quantity: number;
  created_at: string;
};

export type BatchExportManifestItem = {
  index: number;
  activation_code: string;
  activation_url: string;
  status: string;
  filename_png: string;
  filename_svg: string;
};

export type BatchExportFile = {
  path: string;
  content: Buffer | string;
};

export type BatchExportResult = {
  template: ExportTemplateKey;
  appUrl: string;
  batch: BatchExportMeta;
  manifest: {
    exported_at: string;
    app_url: string;
    batch: BatchExportMeta;
    template: ExportTemplateKey;
    count: number;
    items: BatchExportManifestItem[];
  };
  files: BatchExportFile[];
};

export function isExportTemplateKey(value: string): value is ExportTemplateKey {
  return value in EXPORT_TEMPLATES;
}

export function detectExportTemplate(productLabel: string | null | undefined): ExportTemplateKey {
  const text = (productLabel ?? "").toLowerCase();
  if (text.includes("llavero")) return "llavero";
  if (text.includes("credencial")) return "credencial";
  if (
    text.includes("valija") ||
    text.includes("mochila") ||
    text.includes("colgante") ||
    text.includes("enganche")
  ) {
    return "valija";
  }
  if (text.includes("sticker") || text.includes("etiqueta")) return "sticker";
  return "minimal";
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function qrPngBuffer(url: string, width = 1024): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "H",
    type: "png",
    width,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

function buildLabelSvg({
  templateKey,
  activationCode,
  qrDataUri,
}: {
  templateKey: ExportTemplateKey;
  activationCode: string;
  qrDataUri: string;
}): string {
  const template = EXPORT_TEMPLATES[templateKey];
  const { width, height, brand, lines, domainFooter, qrSize, qrY } = template;
  const qrX = (width - qrSize) / 2;
  const codeY = height - 36;
  const hostname = getAppHostname();
  const displayLines = domainFooter ? [...lines, hostname] : lines;

  const brandSvg = brand
    ? `<text x="${width / 2}" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800"><tspan fill="#111111">SOS</tspan><tspan fill="#7C3AED">me</tspan></text>`
    : "";

  const lineStartY = brand ? 72 : 36;
  const lineSvg = displayLines
    .map((line, idx) => {
      const y = lineStartY + idx * 22;
      const isFooter = domainFooter && idx === displayLines.length - 1;
      return `<text x="${width / 2}" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${isFooter ? 16 : 14}" font-weight="${isFooter ? 600 : 700}" fill="${isFooter ? "#6B7280" : "#111111"}">${escapeXml(line)}</text>`;
    })
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${brandSvg}
  ${lineSvg}
  <image x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" href="${qrDataUri}"/>
  <text x="${width / 2}" y="${codeY}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#374151">${escapeXml(activationCode)}</text>
</svg>`;
}

function buildPrintSheetHtml({
  batchMeta,
  items,
  templateKey,
}: {
  batchMeta: BatchExportMeta;
  items: BatchExportManifestItem[];
  templateKey: ExportTemplateKey;
}): string {
  const template = EXPORT_TEMPLATES[templateKey];
  const cards = items
    .map(
      (item) => `
      <article class="label-card">
        <object data="labels/${item.filename_svg}" type="image/svg+xml" class="label-svg"></object>
        <p class="meta">${escapeXml(item.activation_code)} · ${escapeXml(item.status)}</p>
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Lote ${escapeXml(batchMeta.id.slice(0, 8))} — SOSme</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .sub { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${Math.min(template.width + 24, 320)}px, 1fr));
      gap: 16px;
    }
    .label-card {
      border: 1px dashed #ccc;
      padding: 8px;
      break-inside: avoid;
      page-break-inside: avoid;
      text-align: center;
      background: #fff;
    }
    .label-svg { width: 100%; max-width: ${template.width}px; height: auto; }
    .meta { font-size: 11px; color: #666; margin: 6px 0 0; font-family: monospace; }
    @media print {
      body { margin: 8mm; }
      .label-card { border-color: #ddd; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <h1>Etiquetas SOSme — ${escapeXml(template.label)}</h1>
    <p class="sub">${escapeXml(batchMeta.partner_name)}${batchMeta.product_label ? ` · ${escapeXml(batchMeta.product_label)}` : ""} · ${items.length} unidades</p>
    <p class="sub">Imprimí esta página o usá los SVG/PNG incluidos en el ZIP.</p>
  </div>
  <div class="grid">
    ${cards}
  </div>
</body>
</html>`;
}

export async function generateBatchExportFiles(input: {
  batch: BatchExportMeta;
  activations: QrActivationRow[];
  appUrl: string;
  template?: ExportTemplateKey;
  onlyUnclaimed?: boolean;
}): Promise<BatchExportResult> {
  const templateKey =
    input.template ?? detectExportTemplate(input.batch.product_label);

  let activations = input.activations;
  if (input.onlyUnclaimed) {
    activations = activations.filter((a) => a.status === "unclaimed");
  }

  if (activations.length === 0) {
    throw new Error("No hay códigos para exportar");
  }

  const manifestItems: BatchExportManifestItem[] = [];
  const files: BatchExportFile[] = [];

  for (let i = 0; i < activations.length; i++) {
    const activation = activations[i];
    const code = activation.activation_code;
    const url = getActivationUrl(code);
    const index = String(i + 1).padStart(3, "0");
    const safeCode = code.replace(/[^A-Za-z0-9]/g, "");
    const baseName = `${index}_${safeCode}`;
    const pngPath = `qr-only/${baseName}.png`;
    const svgFileName = `${baseName}.svg`;
    const svgPath = `labels/${svgFileName}`;

    const pngBuffer = await qrPngBuffer(url);
    files.push({ path: pngPath, content: pngBuffer });

    const qrThumb = await qrPngBuffer(url, 512);
    const qrDataUri = `data:image/png;base64,${qrThumb.toString("base64")}`;
    const labelSvg = buildLabelSvg({
      templateKey,
      activationCode: code,
      qrDataUri,
    });
    files.push({ path: svgPath, content: labelSvg });

    manifestItems.push({
      index: i + 1,
      activation_code: code,
      activation_url: url,
      status: activation.status,
      filename_png: pngPath,
      filename_svg: svgFileName,
    });
  }

  const manifest = {
    exported_at: new Date().toISOString(),
    app_url: input.appUrl,
    batch: input.batch,
    template: templateKey,
    count: manifestItems.length,
    items: manifestItems,
  };

  files.push({
    path: "manifest.json",
    content: JSON.stringify(manifest, null, 2),
  });

  files.push({
    path: "print-sheet.html",
    content: buildPrintSheetHtml({
      batchMeta: input.batch,
      items: manifestItems,
      templateKey,
    }),
  });

  files.push({
    path: "LEEME.txt",
    content: `SOSme — archivos para imprenta

Lote: ${input.batch.partner_name}${input.batch.product_label ? ` · ${input.batch.product_label}` : ""}
Plantilla: ${EXPORT_TEMPLATES[templateKey].label}
Unidades: ${manifestItems.length}
URL base: ${input.appUrl}

Contenido:
- labels/     Etiquetas SVG listas para imprimir (texto + QR + código)
- qr-only/    PNG del QR solo (1024px, alta resolución)
- manifest.json  Índice de códigos
- print-sheet.html  Vista previa en navegador

IMPORTANTE: Cada archivo es único. No mezclar códigos entre productos.
Cada QR apunta a ${input.appUrl}/activar/CODIGO
`,
  });

  return {
    template: templateKey,
    appUrl: input.appUrl,
    batch: input.batch,
    manifest,
    files,
  };
}

export async function buildBatchExportZipBuffer(
  exportResult: BatchExportResult,
): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of exportResult.files) {
    zip.file(file.path, file.content);
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });
}
