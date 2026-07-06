/** 1 mm in PDF points (72 pt / inch ÷ 25.4 mm/inch). */
export const MM_TO_PT = 72 / 25.4;

/** Raster resolution for embedded PNG assets (template + QR). */
export const PRINT_DPI = 300;

/** 1 mm in pixels at {@link PRINT_DPI}. */
export const MM_TO_PX = PRINT_DPI / 25.4;

export const PAGE_MM = 40;
/** Canva export uses 113.28 pt for 40 mm; matches the official llavero template. */
export const PAGE_PT = 113.28;
export const PAGE_PX = 472;

/** Generic centered QR (fallback when no branded template is used). */
export const QR_MM = 25;
export const QR_PT = QR_MM * MM_TO_PT;
export const QR_OFFSET_MM = (PAGE_MM - QR_MM) / 2;
export const QR_OFFSET_PT = QR_OFFSET_MM * MM_TO_PT;
export const QR_PX = Math.round(QR_MM * MM_TO_PX);

/**
 * QR placement measured from `public/templates/llavero-40x40.png`
 * (extracted from the Canva artboard at 472×472 px).
 */
export const LLAVERO_TEMPLATE_LAYOUT = {
  qrOffsetPx: 100,
  qrSizePx: 262,
} as const;

export const LLAVERO_QR_OFFSET_MM =
  (LLAVERO_TEMPLATE_LAYOUT.qrOffsetPx / PAGE_PX) * PAGE_MM;
export const LLAVERO_QR_SIZE_MM =
  (LLAVERO_TEMPLATE_LAYOUT.qrSizePx / PAGE_PX) * PAGE_MM;
export const LLAVERO_QR_OFFSET_PT = LLAVERO_QR_OFFSET_MM * MM_TO_PT;
export const LLAVERO_QR_PT = LLAVERO_QR_SIZE_MM * MM_TO_PT;
export const LLAVERO_QR_PX = LLAVERO_TEMPLATE_LAYOUT.qrSizePx;

export const CUT_CIRCLE_MM = 40;
export const KEYRING_HOLE_MM = 3;

export const LAYER_DESIGN = "Diseño";
export const LAYER_CUT = "Corte y Perforado";

export const DEFAULT_PRINT_TEMPLATE_PATH =
  "public/templates/llavero-40x40.png";

export const DEFAULT_PRINT_TEMPLATE_SOURCE_PDF =
  "public/templates/llavero-40x40-design.pdf";
