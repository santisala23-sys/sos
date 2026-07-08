import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  createPrintTemplate,
  listPrintTemplates,
} from "@/lib/db/queries-print-templates";
import {
  createDefaultLayoutForSize,
  parsePrintTemplateLayout,
} from "@/lib/activation/print-template-types";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async () => {
    const templates = await listPrintTemplates();
    return NextResponse.json({ templates });
  },
);

export const POST = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    let body: {
      name?: string;
      slug?: string;
      page_width_mm?: number;
      page_height_mm?: number;
      layout_json?: unknown;
      cut_layer_enabled?: boolean;
      is_default?: boolean;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const pageWidth = Number(body.page_width_mm ?? 40);
    const pageHeight = Number(body.page_height_mm ?? 40);

    if (
      !Number.isFinite(pageWidth) ||
      !Number.isFinite(pageHeight) ||
      pageWidth < 5 ||
      pageHeight < 5 ||
      pageWidth > 300 ||
      pageHeight > 300
    ) {
      return NextResponse.json(
        { error: "Las dimensiones deben estar entre 5 y 300 mm" },
        { status: 400 },
      );
    }

    const layout =
      parsePrintTemplateLayout(body.layout_json) ??
      createDefaultLayoutForSize(pageWidth, pageHeight);

    try {
      const template = await createPrintTemplate({
        name,
        slug: body.slug,
        page_width_mm: pageWidth,
        page_height_mm: pageHeight,
        layout_json: layout,
        cut_layer_enabled: body.cut_layer_enabled ?? false,
        is_default: body.is_default ?? false,
      });
      return NextResponse.json({ template }, { status: 201 });
    } catch (error) {
      console.error("[print-templates POST]", error);
      return NextResponse.json({ error: "Error al crear plantilla" }, { status: 500 });
    }
  },
);
