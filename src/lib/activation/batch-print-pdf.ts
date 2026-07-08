import fs from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { injectPdfOptionalContentGroups } from "@/lib/activation/pdf-ocg-layers";
import {
  LAYER_CUT,
  LAYER_DESIGN,
  MM_TO_PT,
  MM_TO_PX,
  PRINT_DPI,
} from "@/lib/activation/print-pdf-constants";
import {
  isCutGuideElement,
  resolveTemplateText,
  type PrintTemplateElement,
  type PrintTemplateRow,
} from "@/lib/activation/print-template-types";
import { getAppHostname } from "@/lib/utils/app-url";

export type PrintPdfItem = {
  activationUrl: string;
  label?: string;
};

export type BuildBatchPrintPdfOptions = {
  items: PrintPdfItem[];
  template?: PrintTemplateRow | null;
};

const MAGENTA = "#FF00FF";

function beginLayerMarker(layer: "DESIGN" | "CUT"): string {
  return `%__LAYER_${layer}_BEGIN__`;
}

function endLayerMarker(layer: "DESIGN" | "CUT"): string {
  return `%__LAYER_${layer}_END__`;
}

function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

function yMmToPt(yMm: number): number {
  return mmToPt(yMm);
}

async function readAssetBuffer(assetUrl: string): Promise<Buffer | null> {
  if (!assetUrl || assetUrl.startsWith("data:")) {
    if (assetUrl?.startsWith("data:")) {
      const base64 = assetUrl.split(",")[1];
      if (base64) return Buffer.from(base64, "base64");
    }
    return null;
  }

  const relativePath = assetUrl.startsWith("/")
    ? assetUrl.slice(1)
    : assetUrl;
  const absolutePath = path.join(process.cwd(), relativePath);

  try {
    return await fs.readFile(absolutePath);
  } catch {
    return null;
  }
}

async function generateQrPng(url: string, sizePx: number): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width: sizePx,
    margin: 0,
    errorCorrectionLevel: "M",
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

async function drawDesignFromTemplate(
  doc: InstanceType<typeof PDFDocument>,
  template: PrintTemplateRow,
  item: PrintPdfItem,
  assetCache: Map<string, Buffer | null>,
): Promise<void> {
  const pageWidthPt = mmToPt(template.page_width_mm);
  const pageHeightPt = mmToPt(template.page_height_mm);
  const hostname = getAppHostname();

  doc.addContent(beginLayerMarker("DESIGN"));

  doc.rect(0, 0, pageWidthPt, pageHeightPt).fill("#FFFFFF");

  for (const element of template.layout_json.elements) {
    if (element.type === "background") {
      continue;
    }

    if (element.type === "qr") {
      const qrPx = Math.max(1, Math.round(element.sizeMm * MM_TO_PX));
      const qrPt = mmToPt(element.sizeMm);
      const qrX = mmToPt(element.xMm);
      const qrY = yMmToPt(element.yMm);
      const qrPng = await generateQrPng(item.activationUrl, qrPx);
      doc.image(qrPng, qrX, qrY, { width: qrPt, height: qrPt });
      continue;
    }

    if (element.type === "image") {
      let buffer = assetCache.get(element.assetUrl);
      if (buffer === undefined) {
        buffer = await readAssetBuffer(element.assetUrl);
        assetCache.set(element.assetUrl, buffer);
      }
      if (!buffer) continue;

      const widthPt = mmToPt(element.widthMm);
      const heightPt = mmToPt(element.heightMm);
      const x = mmToPt(element.xMm);
      const y = yMmToPt(element.yMm);
      doc.image(buffer, x, y, { width: widthPt, height: heightPt });
      continue;
    }

    if (element.type === "text") {
      const content = resolveTemplateText(element, {
        activationCode: item.label,
        hostname,
      });
      const fontSize = element.fontSizePt;
      const fontFamily = element.fontFamily ?? "Helvetica";
      const fontWeight = element.fontWeight ?? "normal";
      const fontName =
        fontWeight === "bold" && fontFamily === "Helvetica"
          ? "Helvetica-Bold"
          : fontFamily;

      doc.font(fontName).fontSize(fontSize).fillColor(element.fill ?? "#000000");

      const widthPt = element.widthMm
        ? mmToPt(element.widthMm)
        : pageWidthPt - mmToPt(element.xMm);
      const x = mmToPt(element.xMm);
      const y = yMmToPt(element.yMm);

      doc.text(content, x, y, {
        width: widthPt,
        align: element.align,
        lineBreak: false,
      });
    }
  }

  doc.addContent(endLayerMarker("DESIGN"));
}

function drawCutFromTemplate(
  doc: InstanceType<typeof PDFDocument>,
  template: PrintTemplateRow,
): void {
  const cutElements = template.layout_json.elements.filter(isCutGuideElement);

  if (cutElements.length === 0) return;

  doc.addContent(beginLayerMarker("CUT"));
  doc.save();
  doc.lineWidth(0.25 * MM_TO_PT);
  doc.strokeColor(MAGENTA);

  for (const element of cutElements) {
    if (element.type === "cut_circle") {
      doc
        .circle(
          mmToPt(element.centerXMm),
          mmToPt(element.centerYMm),
          mmToPt(element.radiusMm),
        )
        .stroke();
      continue;
    }

    if (element.type === "cut_rect") {
      doc
        .rect(
          mmToPt(element.xMm),
          mmToPt(element.yMm),
          mmToPt(element.widthMm),
          mmToPt(element.heightMm),
        )
        .stroke();
      continue;
    }

    doc
      .circle(mmToPt(element.xMm), mmToPt(element.yMm), mmToPt(element.radiusMm))
      .stroke();
  }

  doc.restore();
  doc.addContent(endLayerMarker("CUT"));
}

async function renderTemplatePdf(
  options: BuildBatchPrintPdfOptions,
  template: PrintTemplateRow,
): Promise<Buffer> {
  const { items } = options;
  const pageWidthPt = mmToPt(template.page_width_mm);
  const pageHeightPt = mmToPt(template.page_height_mm);
  const assetCache = new Map<string, Buffer | null>();

  const doc = new PDFDocument({
    autoFirstPage: false,
    size: [pageWidthPt, pageHeightPt],
    margin: 0,
    info: {
      Title: `SOSME — ${template.name}`,
      Author: getAppHostname(),
      Subject: template.cut_layer_enabled
        ? `Capas: ${LAYER_DESIGN}, ${LAYER_CUT}`
        : LAYER_DESIGN,
    },
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  for (const item of items) {
    doc.addPage({ size: [pageWidthPt, pageHeightPt], margin: 0 });
    await drawDesignFromTemplate(doc, template, item, assetCache);
    if (template.cut_layer_enabled) {
      drawCutFromTemplate(doc, template);
    }
  }

  doc.end();
  return done;
}

/** Genera PDF multipágina según plantilla con capas OCG opcionales. */
export async function buildBatchPrintPdf(
  options: BuildBatchPrintPdfOptions,
): Promise<Buffer> {
  const { items, template } = options;

  if (items.length === 0) {
    throw new Error("No hay URLs para generar el PDF de imprenta.");
  }

  if (!template) {
    throw new Error("Se requiere una plantilla de imprenta.");
  }

  const rawPdf = await renderTemplatePdf(options, template);
  return injectPdfOptionalContentGroups(rawPdf);
}

export const printPdfMeta = {
  dpi: PRINT_DPI,
  mmToPt: MM_TO_PT,
  mmToPx: MM_TO_PX,
} as const;
