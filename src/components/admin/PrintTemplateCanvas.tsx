"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Canvas,
  Circle,
  FabricImage,
  FabricText,
  Rect,
  type FabricObject,
} from "fabric";
import QRCode from "react-qr-code";
import { createRoot } from "react-dom/client";
import {
  EDITOR_PX_PER_MM,
  editorPxToMm,
  mmToEditorPx,
  roundMm,
  sanitizeTemplateLayout,
  type PrintTemplateElement,
  type PrintTemplateLayout,
} from "@/lib/activation/print-template-types";

const PAGE_OFFSET_PX = 20;
const SAMPLE_QR_URL = "https://sosme.app/activar/SOS-DEMO";
const CUT_STROKE = "#FF00FF";

function isCutType(type: PrintTemplateElement["type"]): boolean {
  return type === "cut_circle" || type === "cut_hole" || type === "cut_rect";
}

function styleCutGuide(obj: FabricObject): void {
  obj.set({
    fill: "transparent",
    stroke: CUT_STROKE,
    strokeWidth: 1,
    strokeUniform: true,
  });
}

export type CanvasLayerItem = {
  id: string;
  type: PrintTemplateElement["type"];
  label: string;
};

export function layerLabel(meta: SosMeta): string {
  switch (meta.sosType) {
    case "background":
      return "Fondo";
    case "qr":
      return "QR (dinámico)";
    case "text":
      return meta.content?.trim() ? `Texto: ${meta.content}` : "Texto";
    case "image":
      return "Imagen / logo";
    case "cut_circle":
      return "Corte (círculo)";
    case "cut_rect":
      return "Corte (rectángulo)";
    case "cut_hole":
      return "Perforación";
    default:
      return meta.sosType;
  }
}

type SosMeta = {
  sosType: PrintTemplateElement["type"];
  sosId: string;
  bindTo?: "activation_code" | "hostname" | null;
  assetUrl?: string;
  content?: string;
  fontSizePt?: number;
  fontFamily?: string;
  fontWeight?: string;
  align?: "left" | "center" | "right";
  fill?: string;
};

function getMeta(obj: FabricObject): SosMeta | null {
  const data = obj.get("data") as SosMeta | undefined;
  return data?.sosType ? data : null;
}

function setMeta(obj: FabricObject, meta: SosMeta): void {
  obj.set("data", meta);
}

function isPageChrome(obj: FabricObject): boolean {
  return !getMeta(obj);
}

function findObjectById(canvas: Canvas, id: string): FabricObject | undefined {
  return canvas.getObjects().find((obj) => getMeta(obj)?.sosId === id);
}

function applyCutGuideVisibility(obj: FabricObject, visible: boolean): void {
  const meta = getMeta(obj);
  if (meta && isCutType(meta.sosType)) {
    obj.set({ visible, evented: visible, selectable: visible });
  }
}

function syncCutGuideVisibility(canvas: Canvas, showCutGuides: boolean): void {
  for (const obj of canvas.getObjects()) {
    applyCutGuideVisibility(obj, showCutGuides);
  }
}

function buildLayerList(canvas: Canvas): CanvasLayerItem[] {
  const managed = canvas
    .getObjects()
    .filter((obj) => getMeta(obj))
    .slice()
    .reverse();

  return managed.map((obj) => {
    const meta = getMeta(obj)!;
    return {
      id: meta.sosId,
      type: meta.sosType,
      label: layerLabel(meta),
    };
  });
}

async function renderQrPlaceholder(sizePx: number): Promise<string> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(
    <QRCode value={SAMPLE_QR_URL} size={sizePx} bgColor="#FFFFFF" fgColor="#000000" />,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const svg = container.querySelector("svg");
  if (!svg) {
    root.unmount();
    container.remove();
    return "";
  }
  const serialized = new XMLSerializer().serializeToString(svg);
  const dataUrl = `data:image/svg+xml;base64,${btoa(serialized)}`;
  root.unmount();
  container.remove();
  return dataUrl;
}

function objectToElement(
  obj: FabricObject,
  pageWidthMm: number,
  pageHeightMm: number,
): PrintTemplateElement | null {
  const meta = getMeta(obj);
  if (!meta || meta.sosType === "background") return null;

  const left = (obj.left ?? 0) - PAGE_OFFSET_PX;
  const top = (obj.top ?? 0) - PAGE_OFFSET_PX;
  const scaleX = obj.scaleX ?? 1;
  const scaleY = obj.scaleY ?? 1;

  if (meta.sosType === "qr") {
    const widthPx = (obj.width ?? 0) * scaleX;
    return {
      id: meta.sosId,
      type: "qr",
      xMm: roundMm(editorPxToMm(left)),
      yMm: roundMm(editorPxToMm(top)),
      sizeMm: roundMm(editorPxToMm(widthPx)),
    };
  }

  if (meta.sosType === "text") {
    const textObj = obj as FabricText;
    return {
      id: meta.sosId,
      type: "text",
      xMm: roundMm(editorPxToMm(left)),
      yMm: roundMm(editorPxToMm(top)),
      widthMm: roundMm(editorPxToMm((textObj.width ?? 0) * scaleX)),
      content: meta.content ?? String(textObj.text ?? ""),
      fontSizePt: meta.fontSizePt ?? 8,
      fontFamily: meta.fontFamily ?? "Helvetica",
      fontWeight: meta.fontWeight ?? "normal",
      align: meta.align ?? "left",
      fill: meta.fill ?? "#000000",
      bindTo: meta.bindTo ?? null,
    };
  }

  if (meta.sosType === "image") {
    const widthPx = (obj.width ?? 0) * scaleX;
    const heightPx = (obj.height ?? 0) * scaleY;
    if (!meta.assetUrl) return null;
    return {
      id: meta.sosId,
      type: "image",
      xMm: roundMm(editorPxToMm(left)),
      yMm: roundMm(editorPxToMm(top)),
      widthMm: roundMm(editorPxToMm(widthPx)),
      heightMm: roundMm(editorPxToMm(heightPx)),
      assetUrl: meta.assetUrl,
    };
  }

  if (meta.sosType === "cut_circle") {
    const circle = obj as Circle;
    const radiusPx = (circle.radius ?? 0) * scaleX;
    return {
      id: meta.sosId,
      type: "cut_circle",
      centerXMm: roundMm(editorPxToMm(left)),
      centerYMm: roundMm(editorPxToMm(top)),
      radiusMm: roundMm(editorPxToMm(radiusPx)),
    };
  }

  if (meta.sosType === "cut_hole") {
    const circle = obj as Circle;
    const radiusPx = (circle.radius ?? 0) * scaleX;
    return {
      id: meta.sosId,
      type: "cut_hole",
      xMm: roundMm(editorPxToMm(left)),
      yMm: roundMm(editorPxToMm(top)),
      radiusMm: roundMm(editorPxToMm(radiusPx)),
    };
  }

  if (meta.sosType === "cut_rect") {
    const widthPx = (obj.width ?? 0) * scaleX;
    const heightPx = (obj.height ?? 0) * scaleY;
    return {
      id: meta.sosId,
      type: "cut_rect",
      xMm: roundMm(editorPxToMm(left)),
      yMm: roundMm(editorPxToMm(top)),
      widthMm: roundMm(editorPxToMm(widthPx)),
      heightMm: roundMm(editorPxToMm(heightPx)),
    };
  }

  void pageWidthMm;
  void pageHeightMm;
  return null;
}

export function layoutToCanvasObjects(
  layout: PrintTemplateLayout,
  pageWidthMm: number,
  pageHeightMm: number,
): Promise<FabricObject[]> {
  const objects: Promise<FabricObject | null>[] = sanitizeTemplateLayout(layout).elements.map(
    async (element) => {
      if (element.type === "background") {
        return null;
      }

      if (element.type === "qr") {
        const sizePx = mmToEditorPx(element.sizeMm);
        const dataUrl = await renderQrPlaceholder(sizePx);
        const left = PAGE_OFFSET_PX + mmToEditorPx(element.xMm);
        const top = PAGE_OFFSET_PX + mmToEditorPx(element.yMm);
        if (dataUrl) {
          const img = await FabricImage.fromURL(dataUrl);
          img.set({
            left,
            top,
            scaleX: sizePx / (img.width ?? sizePx),
            scaleY: sizePx / (img.height ?? sizePx),
            originX: "left",
            originY: "top",
          });
          setMeta(img, { sosType: "qr", sosId: element.id });
          return img;
        }
        const rect = new Rect({
          left,
          top,
          width: sizePx,
          height: sizePx,
          fill: "#FFFFFF",
          stroke: "#111827",
          strokeDashArray: [6, 4],
        });
        setMeta(rect, { sosType: "qr", sosId: element.id });
        return rect;
      }

      if (element.type === "text") {
        const text = new FabricText(element.content, {
          left: PAGE_OFFSET_PX + mmToEditorPx(element.xMm),
          top: PAGE_OFFSET_PX + mmToEditorPx(element.yMm),
          fontSize: element.fontSizePt * 1.33,
          fontFamily: element.fontFamily ?? "Helvetica, Arial, sans-serif",
          fontWeight: element.fontWeight ?? "normal",
          fill: element.fill ?? "#000000",
          textAlign: element.align,
          width: element.widthMm ? mmToEditorPx(element.widthMm) : undefined,
        });
        setMeta(text, {
          sosType: "text",
          sosId: element.id,
          content: element.content,
          fontSizePt: element.fontSizePt,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          align: element.align,
          fill: element.fill,
          bindTo: element.bindTo ?? null,
        });
        return text;
      }

      if (element.type === "image") {
        try {
          const img = await FabricImage.fromURL(element.assetUrl, {
            crossOrigin: "anonymous",
          });
          img.set({
            left: PAGE_OFFSET_PX + mmToEditorPx(element.xMm),
            top: PAGE_OFFSET_PX + mmToEditorPx(element.yMm),
            scaleX: mmToEditorPx(element.widthMm) / (img.width ?? 1),
            scaleY: mmToEditorPx(element.heightMm) / (img.height ?? 1),
            originX: "left",
            originY: "top",
          });
          setMeta(img, {
            sosType: "image",
            sosId: element.id,
            assetUrl: element.assetUrl,
          });
          return img;
        } catch {
          return null;
        }
      }

      if (element.type === "cut_circle") {
        const circle = new Circle({
          left: PAGE_OFFSET_PX + mmToEditorPx(element.centerXMm),
          top: PAGE_OFFSET_PX + mmToEditorPx(element.centerYMm),
          radius: mmToEditorPx(element.radiusMm),
          originX: "center",
          originY: "center",
        });
        styleCutGuide(circle);
        setMeta(circle, { sosType: "cut_circle", sosId: element.id });
        return circle;
      }

      if (element.type === "cut_rect") {
        const rect = new Rect({
          left: PAGE_OFFSET_PX + mmToEditorPx(element.xMm),
          top: PAGE_OFFSET_PX + mmToEditorPx(element.yMm),
          width: mmToEditorPx(element.widthMm),
          height: mmToEditorPx(element.heightMm),
          originX: "left",
          originY: "top",
        });
        styleCutGuide(rect);
        setMeta(rect, { sosType: "cut_rect", sosId: element.id });
        return rect;
      }

      if (element.type === "cut_hole") {
        const circle = new Circle({
          left: PAGE_OFFSET_PX + mmToEditorPx(element.xMm),
          top: PAGE_OFFSET_PX + mmToEditorPx(element.yMm),
          radius: mmToEditorPx(element.radiusMm),
          originX: "center",
          originY: "center",
        });
        styleCutGuide(circle);
        setMeta(circle, { sosType: "cut_hole", sosId: element.id });
        return circle;
      }

      return null;
    },
  );

  return Promise.all(objects).then((list) =>
    list.filter((item): item is FabricObject => item !== null),
  );
}

export function canvasToLayout(
  canvas: Canvas,
  pageWidthMm: number,
  pageHeightMm: number,
): PrintTemplateLayout {
  const elements: PrintTemplateElement[] = [];
  for (const obj of canvas.getObjects()) {
    const element = objectToElement(obj, pageWidthMm, pageHeightMm);
    if (element) elements.push(element);
  }
  return sanitizeTemplateLayout({ version: 1, elements });
}

export type PrintTemplateCanvasHandle = {
  getLayout: () => PrintTemplateLayout;
  getLayers: () => CanvasLayerItem[];
  addQr: () => Promise<void>;
  addText: () => void;
  addImage: (url: string) => Promise<void>;
  addCutCircle: () => void;
  addCutRect: () => void;
  addCutHole: () => void;
  alignSelected: (mode: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => void;
  deleteLayer: (id: string) => void;
  deleteSelected: () => void;
  moveLayer: (id: string, direction: "up" | "down") => void;
  selectLayer: (id: string) => void;
};

type PrintTemplateCanvasProps = {
  pageWidthMm: number;
  pageHeightMm: number;
  layout: PrintTemplateLayout;
  showCutGuides?: boolean;
  onSelectionChange?: (meta: SosMeta | null) => void;
  onLayersChange?: (layers: CanvasLayerItem[]) => void;
  canvasRef?: React.RefObject<PrintTemplateCanvasHandle | null>;
};

export function PrintTemplateCanvas({
  pageWidthMm,
  pageHeightMm,
  layout,
  showCutGuides = true,
  onSelectionChange,
  onLayersChange,
  canvasRef,
}: PrintTemplateCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onLayersChangeRef = useRef(onLayersChange);
  const showCutGuidesRef = useRef(showCutGuides);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
    onLayersChangeRef.current = onLayersChange;
    showCutGuidesRef.current = showCutGuides;
  }, [onSelectionChange, onLayersChange, showCutGuides]);

  const notifyLayersChange = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    onLayersChangeRef.current?.(buildLayerList(canvas));
  }, []);

  const notifySelectionChange = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    onSelectionChangeRef.current?.(active ? getMeta(active) : null);
  }, []);

  const pageWidthPx = mmToEditorPx(pageWidthMm);
  const pageHeightPx = mmToEditorPx(pageHeightMm);

  const getLayout = useCallback((): PrintTemplateLayout => {
    if (!fabricRef.current) return layout;
    return canvasToLayout(fabricRef.current, pageWidthMm, pageHeightMm);
  }, [layout, pageWidthMm, pageHeightMm]);

  const addQr = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const sizeMm = Math.min(pageWidthMm, pageHeightMm) * 0.45;
    const sizePx = mmToEditorPx(sizeMm);
    const dataUrl = await renderQrPlaceholder(sizePx);
    const left = PAGE_OFFSET_PX + mmToEditorPx((pageWidthMm - sizeMm) / 2);
    const top = PAGE_OFFSET_PX + mmToEditorPx((pageHeightMm - sizeMm) / 2);
    let obj: FabricObject;
    if (dataUrl) {
      const img = await FabricImage.fromURL(dataUrl);
      img.set({
        left,
        top,
        scaleX: sizePx / (img.width ?? sizePx),
        scaleY: sizePx / (img.height ?? sizePx),
      });
      setMeta(img, { sosType: "qr", sosId: `qr-${Date.now()}` });
      obj = img;
    } else {
      obj = new Rect({
        left,
        top,
        width: sizePx,
        height: sizePx,
        fill: "#FFFFFF",
        stroke: "#111827",
        strokeDashArray: [6, 4],
      });
      setMeta(obj, { sosType: "qr", sosId: `qr-${Date.now()}` });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [pageWidthMm, pageHeightMm, notifyLayersChange, notifySelectionChange]);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new FabricText("Texto", {
      left: PAGE_OFFSET_PX + mmToEditorPx(pageWidthMm / 4),
      top: PAGE_OFFSET_PX + mmToEditorPx(pageHeightMm / 4),
      fontSize: 10,
      fill: "#000000",
    });
    setMeta(text, {
      sosType: "text",
      sosId: `text-${Date.now()}`,
      content: "Texto",
      fontSizePt: 8,
      align: "left",
      fill: "#000000",
      bindTo: null,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [pageWidthMm, pageHeightMm, notifyLayersChange, notifySelectionChange]);

  const addImage = useCallback(
    async (url: string) => {
      const canvas = fabricRef.current;
      if (!canvas) {
        throw new Error("El lienzo todavía no está listo.");
      }

      const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const targetWidth = mmToEditorPx(pageWidthMm * 0.3);
      img.set({
        left: PAGE_OFFSET_PX + mmToEditorPx(pageWidthMm * 0.1),
        top: PAGE_OFFSET_PX + mmToEditorPx(pageHeightMm * 0.1),
        scaleX: targetWidth / (img.width ?? targetWidth),
        scaleY: targetWidth / (img.width ?? targetWidth),
      });
      setMeta(img, { sosType: "image", sosId: `img-${Date.now()}`, assetUrl: url });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.bringObjectToFront(img);
      canvas.requestRenderAll();
      notifyLayersChange();
      notifySelectionChange();
    },
    [pageWidthMm, pageHeightMm, notifyLayersChange, notifySelectionChange],
  );

  const addCutCircle = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const circle = new Circle({
      left: PAGE_OFFSET_PX + pageWidthPx / 2,
      top: PAGE_OFFSET_PX + pageHeightPx / 2,
      radius: Math.min(pageWidthPx, pageHeightPx) / 2,
      originX: "center",
      originY: "center",
    });
    styleCutGuide(circle);
    setMeta(circle, { sosType: "cut_circle", sosId: `cut-${Date.now()}` });
    applyCutGuideVisibility(circle, showCutGuidesRef.current);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [pageWidthPx, pageHeightPx, notifyLayersChange, notifySelectionChange]);

  const addCutRect = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new Rect({
      left: PAGE_OFFSET_PX,
      top: PAGE_OFFSET_PX,
      width: pageWidthPx,
      height: pageHeightPx,
      originX: "left",
      originY: "top",
    });
    styleCutGuide(rect);
    setMeta(rect, { sosType: "cut_rect", sosId: `cut-rect-${Date.now()}` });
    applyCutGuideVisibility(rect, showCutGuidesRef.current);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [pageWidthPx, pageHeightPx, notifyLayersChange, notifySelectionChange]);

  const addCutHole = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const circle = new Circle({
      left: PAGE_OFFSET_PX + pageWidthPx / 2,
      top: PAGE_OFFSET_PX + pageHeightPx,
      radius: mmToEditorPx(1.5),
      originX: "center",
      originY: "center",
    });
    styleCutGuide(circle);
    setMeta(circle, { sosType: "cut_hole", sosId: `hole-${Date.now()}` });
    applyCutGuideVisibility(circle, showCutGuidesRef.current);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [pageWidthPx, pageHeightPx, notifyLayersChange, notifySelectionChange]);

  const deleteLayer = useCallback(
    (id: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = findObjectById(canvas, id);
      const meta = obj ? getMeta(obj) : null;
      if (!obj || !meta) return;
      canvas.remove(obj);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      notifyLayersChange();
      notifySelectionChange();
    },
    [notifyLayersChange, notifySelectionChange],
  );

  const deleteSelectedRef = useRef<() => void>(() => {});

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    const meta = active ? getMeta(active) : null;
    if (!active || !meta) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    notifyLayersChange();
    notifySelectionChange();
  }, [notifyLayersChange, notifySelectionChange]);

  useEffect(() => {
    deleteSelectedRef.current = deleteSelected;
  }, [deleteSelected]);

  const moveLayer = useCallback(
    (id: string, direction: "up" | "down") => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = findObjectById(canvas, id);
      const meta = obj ? getMeta(obj) : null;
      if (!obj || !meta) return;

      if (direction === "up") canvas.bringObjectForward(obj);
      else canvas.sendObjectBackwards(obj);

      canvas.requestRenderAll();
      notifyLayersChange();
    },
    [notifyLayersChange],
  );

  const selectLayer = useCallback(
    (id: string) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = findObjectById(canvas, id);
      if (!obj) return;
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      notifySelectionChange();
    },
    [notifySelectionChange],
  );

  const getLayers = useCallback((): CanvasLayerItem[] => {
    const canvas = fabricRef.current;
    if (!canvas) return [];
    return buildLayerList(canvas);
  }, []);

  const alignSelected = useCallback(
    (mode: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj || !getMeta(obj)) return;

      const bounds = obj.getBoundingRect();
      const width = bounds.width;
      const height = bounds.height;
      const originOffsetX = (obj.left ?? 0) - bounds.left;
      const originOffsetY = (obj.top ?? 0) - bounds.top;

      if (mode === "left") obj.set("left", PAGE_OFFSET_PX + originOffsetX);
      if (mode === "center-h") {
        obj.set("left", PAGE_OFFSET_PX + (pageWidthPx - width) / 2 + originOffsetX);
      }
      if (mode === "right") {
        obj.set("left", PAGE_OFFSET_PX + pageWidthPx - width + originOffsetX);
      }
      if (mode === "top") obj.set("top", PAGE_OFFSET_PX + originOffsetY);
      if (mode === "center-v") {
        obj.set("top", PAGE_OFFSET_PX + (pageHeightPx - height) / 2 + originOffsetY);
      }
      if (mode === "bottom") {
        obj.set("top", PAGE_OFFSET_PX + pageHeightPx - height + originOffsetY);
      }

      obj.setCoords();
      canvas.requestRenderAll();
      notifyLayersChange();
    },
    [pageWidthPx, pageHeightPx, notifyLayersChange],
  );

  useEffect(() => {
    if (!canvasRef) return;
    canvasRef.current = {
      getLayout,
      getLayers,
      addQr,
      addText,
      addImage,
      addCutCircle,
      addCutRect,
      addCutHole,
      alignSelected,
      deleteLayer,
      deleteSelected,
      moveLayer,
      selectLayer,
    };
  }, [
    canvasRef,
    getLayout,
    getLayers,
    addQr,
    addText,
    addImage,
    addCutCircle,
    addCutRect,
    addCutHole,
    alignSelected,
    deleteLayer,
    deleteSelected,
    moveLayer,
    selectLayer,
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const canvasEl = document.createElement("canvas");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(canvasEl);

    const canvas = new Canvas(canvasEl, {
      width: pageWidthPx + PAGE_OFFSET_PX * 2,
      height: pageHeightPx + PAGE_OFFSET_PX * 2,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    const pageBorder = new Rect({
      left: PAGE_OFFSET_PX,
      top: PAGE_OFFSET_PX,
      width: pageWidthPx,
      height: pageHeightPx,
      fill: "#ffffff",
      stroke: "#a78bfa",
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    canvas.add(pageBorder);

    canvas.clipPath = new Rect({
      left: PAGE_OFFSET_PX,
      top: PAGE_OFFSET_PX,
      width: pageWidthPx,
      height: pageHeightPx,
      absolutePositioned: true,
      selectable: false,
      evented: false,
    });

    fabricRef.current = canvas;

    void layoutToCanvasObjects(layout, pageWidthMm, pageHeightMm).then((objects) => {
      for (const obj of objects) {
        applyCutGuideVisibility(obj, showCutGuides);
        canvas.add(obj);
      }
      canvas.requestRenderAll();
      setReady(true);
      notifyLayersChange();
    });

    const handleSelection = () => notifySelectionChange();
    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", handleSelection);
    canvas.on("object:modified", notifyLayersChange);

    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedRef.current();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.dispose();
      fabricRef.current = null;
      setReady(false);
    };
  }, [
    pageWidthMm,
    pageHeightMm,
    layout,
    pageWidthPx,
    pageHeightPx,
    notifyLayersChange,
    notifySelectionChange,
  ]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !ready) return;
    syncCutGuideVisibility(canvas, showCutGuides);
    canvas.requestRenderAll();
  }, [showCutGuides, ready]);

  return (
    <div className="flex min-h-[480px] flex-col items-center justify-center overflow-auto rounded-xl border border-violet-200 bg-white p-6 shadow-inner">
      <div ref={containerRef} className="rounded-lg shadow-md ring-1 ring-neutral-200" />
      {!ready && (
        <p className="py-8 text-center text-sm text-neutral-500">Cargando lienzo...</p>
      )}
      <p className="mt-3 text-center text-xs text-neutral-500">
        {pageWidthMm} × {pageHeightMm} mm · {EDITOR_PX_PER_MM}px/mm · Supr para borrar selección
      </p>
    </div>
  );
}
