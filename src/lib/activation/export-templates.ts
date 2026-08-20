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

export function isExportTemplateKey(value: string): value is ExportTemplateKey {
  return value in EXPORT_TEMPLATES;
}

export function detectExportTemplate(
  productLabel: string | null | undefined,
): ExportTemplateKey {
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
