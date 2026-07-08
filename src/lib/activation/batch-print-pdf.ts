import fs from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { injectPdfOptionalContentGroups } from "@/lib/activation/pdf-ocg-layers";
import { getAppHostname } from "@/lib/utils/app-url";
import {
  CUT_CIRCLE_MM,
  DEFAULT_PRINT_TEMPLATE_PATH,
  KEYRING_HOLE_MM,
  LAYER_CUT,
  LAYER_DESIGN,
  LLAVERO_QR_OFFSET_MM,
  LLAVERO_QR_OFFSET_PT,
  LLAVERO_QR_PT,
  LLAVERO_QR_PX,
  LLAVERO_QR_SIZE_MM,
  MM_TO_PT,
  PAGE_MM,
  PAGE_PT,
  QR_OFFSET_PT,
  QR_PT,
  QR_PX,
} from "@/lib/activation/print-pdf-constants";

export type PrintPdfItem = {
  activationUrl: string;
  label?: string;
};

export type BuildBatchPrintPdfOptions = {
  items: PrintPdfItem[];
  templatePath?: string;
};

const MAGENTA = "#FF00FF";

function beginLayerMarker(layer: "DESIGN" | "CUT"): string {
  return `%__LAYER_${layer}_BEGIN__`;
}

function endLayerMarker(layer: "DESIGN" | "CUT"): string {
  return `%__LAYER_${layer}_END__`;
}

async function readTemplateImage(
  templatePath = DEFAULT_PRINT_TEMPLATE_PATH,
): Promise<Buffer | null> {
  const absolutePath = path.isAbsolute(templatePath)
    ? templatePath
    : path.join(process.cwd(), templatePath);

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

function resolveQrLayout(templateImage: Buffer | null): {
  qrPx: number;
  qrPt: number;
  qrOffsetPt: number;
} {
  if (templateImage) {
    return {
      qrPx: LLAVERO_QR_PX,
      qrPt: LLAVERO_QR_PT,
      qrOffsetPt: LLAVERO_QR_OFFSET_PT,
    };
  }

  return {
    qrPx: QR_PX,
    qrPt: QR_PT,
    qrOffsetPt: QR_OFFSET_PT,
  };
}

function drawDesignLayer(
  doc: InstanceType<typeof PDFDocument>,
  templateImage: Buffer | null,
  qrPng: Buffer,
  qrLayout: ReturnType<typeof resolveQrLayout>,
): void {
  doc.addContent(beginLayerMarker("DESIGN"));

  if (templateImage) {
    doc.image(templateImage, 0, 0, {
      width: PAGE_PT,
      height: PAGE_PT,
    });
  } else {
    doc.rect(0, 0, PAGE_PT, PAGE_PT).fill("#FFFFFF");
  }

  const qrX = qrLayout.qrOffsetPt;
  const qrY = PAGE_PT - qrLayout.qrOffsetPt - qrLayout.qrPt;

  doc.image(qrPng, qrX, qrY, {
    width: qrLayout.qrPt,
    height: qrLayout.qrPt,
  });

  doc.addContent(endLayerMarker("DESIGN"));
}

function drawCutLayer(doc: InstanceType<typeof PDFDocument>): void {
  doc.addContent(beginLayerMarker("CUT"));

  const center = PAGE_PT / 2;
  const outerRadius = (CUT_CIRCLE_MM / 2) * MM_TO_PT;
  const holeRadius = (KEYRING_HOLE_MM / 2) * MM_TO_PT;

  doc.save();
  doc.lineWidth(0.25 * MM_TO_PT);
  doc.strokeColor(MAGENTA);
  doc.circle(center, center, outerRadius).stroke();
  doc.circle(center, PAGE_PT, holeRadius).stroke();
  doc.restore();

  doc.addContent(endLayerMarker("CUT"));
}

function drawPrintPage(
  doc: InstanceType<typeof PDFDocument>,
  templateImage: Buffer | null,
  qrPng: Buffer,
  qrLayout: ReturnType<typeof resolveQrLayout>,
): void {
  doc.addPage({ size: [PAGE_PT, PAGE_PT], margin: 0 });
  drawDesignLayer(doc, templateImage, qrPng, qrLayout);
  drawCutLayer(doc);
}

async function renderPdfKitDocument(
  options: BuildBatchPrintPdfOptions,
  templateImage: Buffer | null,
): Promise<Buffer> {
  const { items } = options;

  if (items.length === 0) {
    throw new Error("No hay URLs para generar el PDF de imprenta.");
  }

  const qrLayout = resolveQrLayout(templateImage);

  const doc = new PDFDocument({
    autoFirstPage: false,
    size: [PAGE_PT, PAGE_PT],
    margin: 0,
    info: {
      Title: "SOSME — Lote imprenta",
      Author: getAppHostname(),
      Subject: `Capas: ${LAYER_DESIGN}, ${LAYER_CUT}`,
    },
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  for (const item of items) {
    const qrPng = await generateQrPng(item.activationUrl, qrLayout.qrPx);
    drawPrintPage(doc, templateImage, qrPng, qrLayout);
  }

  doc.end();
  return done;
}

/**
 * Genera un PDF multipágina (40×40 mm) con capas OCG para imprenta y corte láser.
 *
 * Con plantilla Canva (`llavero-40x40.png`):
 * - QR ~22.2×22.2 mm dentro de los corchetes (offset ~8.5 mm)
 *
 * Sin plantilla (fallback):
 * - QR 25×25 mm centrado (offset 7.5 mm)
 */
export async function buildBatchPrintPdf(
  options: BuildBatchPrintPdfOptions,
): Promise<Buffer> {
  const templateImage = await readTemplateImage(options.templatePath);
  const rawPdf = await renderPdfKitDocument(options, templateImage);
  return injectPdfOptionalContentGroups(rawPdf);
}

/** @internal Exported for quick sanity checks in development. */
export const printPdfLayout = {
  pageMm: PAGE_MM,
  pagePt: PAGE_PT,
  pagePxAt300Dpi: 472,
  llavero: {
    qrMm: LLAVERO_QR_SIZE_MM,
    qrOffsetMm: LLAVERO_QR_OFFSET_MM,
    qrPx: LLAVERO_QR_PX,
  },
  fallback: {
    qrMm: 25,
    qrOffsetMm: 7.5,
  },
} as const;
