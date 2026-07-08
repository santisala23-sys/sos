/** Layout serializado desde el editor de plantillas (coordenadas en mm, origen arriba-izquierda). */

export type PrintTemplateLayout = {
  version: 1;
  elements: PrintTemplateElement[];
};

export type PrintTemplateElement =
  | {
      id: string;
      type: "background";
      assetUrl?: string;
      fill?: string;
    }
  | {
      id: string;
      type: "qr";
      xMm: number;
      yMm: number;
      sizeMm: number;
    }
  | {
      id: string;
      type: "text";
      xMm: number;
      yMm: number;
      widthMm?: number;
      content: string;
      fontSizePt: number;
      fontFamily?: string;
      fontWeight?: string;
      align: "left" | "center" | "right";
      fill?: string;
      bindTo?: "activation_code" | "hostname" | null;
    }
  | {
      id: string;
      type: "image";
      xMm: number;
      yMm: number;
      widthMm: number;
      heightMm: number;
      assetUrl: string;
    }
  | {
      id: string;
      type: "cut_circle";
      centerXMm: number;
      centerYMm: number;
      radiusMm: number;
    }
  | {
      id: string;
      type: "cut_hole";
      xMm: number;
      yMm: number;
      radiusMm: number;
    }
  | {
      id: string;
      type: "cut_rect";
      xMm: number;
      yMm: number;
      widthMm: number;
      heightMm: number;
    };

export type CutGuideElement = Extract<
  PrintTemplateElement,
  { type: "cut_circle" | "cut_hole" | "cut_rect" }
>;

export function isCutGuideElement(
  element: PrintTemplateElement,
): element is CutGuideElement {
  return (
    element.type === "cut_circle" ||
    element.type === "cut_hole" ||
    element.type === "cut_rect"
  );
}

export type PrintTemplateRow = {
  id: string;
  name: string;
  slug: string;
  page_width_mm: number;
  page_height_mm: number;
  layout_json: PrintTemplateLayout;
  cut_layer_enabled: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export const PRINT_TEMPLATE_PRESETS = [
  { label: "Llavero 4×4 cm", widthMm: 40, heightMm: 40 },
  { label: "Sticker 5×3 cm", widthMm: 50, heightMm: 30 },
  { label: "Chapita 2.5×2.5 cm", widthMm: 25, heightMm: 25 },
  { label: "Credencial 85×54 mm", widthMm: 85, heightMm: 54 },
  { label: "Personalizado", widthMm: 40, heightMm: 40, custom: true },
] as const;

export const EDITOR_PX_PER_MM = 10;

export function mmToEditorPx(mm: number): number {
  return mm * EDITOR_PX_PER_MM;
}

export function editorPxToMm(px: number): number {
  return px / EDITOR_PX_PER_MM;
}

export function slugifyTemplateName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function createEmptyLayout(): PrintTemplateLayout {
  return { version: 1, elements: [] };
}

export function createDefaultLayoutForSize(
  widthMm: number,
  heightMm: number,
): PrintTemplateLayout {
  const qrSize = Math.min(widthMm, heightMm) * 0.55;
  const qrX = (widthMm - qrSize) / 2;
  const qrY = (heightMm - qrSize) / 2;

  return {
    version: 1,
    elements: [
      {
        id: "qr",
        type: "qr",
        xMm: roundMm(qrX),
        yMm: roundMm(qrY),
        sizeMm: roundMm(qrSize),
      },
    ],
  };
}

/** El lienzo es blanco por defecto; no persistimos capa "background". */
export function sanitizeTemplateLayout(
  layout: PrintTemplateLayout,
): PrintTemplateLayout {
  return {
    version: 1,
    elements: layout.elements.filter((element) => element.type !== "background"),
  };
}

export function roundMm(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parsePrintTemplateLayout(raw: unknown): PrintTemplateLayout | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 1 || !Array.isArray(obj.elements)) return null;
  return { version: 1, elements: obj.elements as PrintTemplateElement[] };
}

export function resolveTemplateText(
  element: Extract<PrintTemplateElement, { type: "text" }>,
  context: { activationCode?: string; hostname: string },
): string {
  if (element.bindTo === "activation_code") {
    return context.activationCode ?? element.content;
  }
  if (element.bindTo === "hostname") {
    return context.hostname;
  }
  return element.content;
}
