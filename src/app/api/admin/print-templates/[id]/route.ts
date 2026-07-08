import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { buildBatchPrintPdf } from "@/lib/activation/batch-print-pdf";
import { getActivationUrl } from "@/lib/activation/codes";
import {
  parsePrintTemplateLayout,
} from "@/lib/activation/print-template-types";
import {
  deletePrintTemplate,
  getPrintTemplateById,
  updatePrintTemplate,
} from "@/lib/db/queries-print-templates";


export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const template = await getPrintTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    if (searchParams.get("format") === "preview") {
      try {
        const sampleCode = searchParams.get("code") ?? "SOS-DEMO";
        const pdfBuffer = await buildBatchPrintPdf({
          template,
          items: [
            {
              activationUrl: getActivationUrl(sampleCode),
              label: sampleCode,
            },
          ],
        });

        return new NextResponse(new Uint8Array(pdfBuffer), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="preview-${template.slug}.pdf"`,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al generar preview";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json({ template });
  },
);

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

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

    if (body.page_width_mm !== undefined || body.page_height_mm !== undefined) {
      const width = Number(body.page_width_mm ?? 40);
      const height = Number(body.page_height_mm ?? 40);
      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < 5 ||
        height < 5 ||
        width > 300 ||
        height > 300
      ) {
        return NextResponse.json(
          { error: "Las dimensiones deben estar entre 5 y 300 mm" },
          { status: 400 },
        );
      }
    }

    const layout = body.layout_json
      ? parsePrintTemplateLayout(body.layout_json)
      : undefined;

    if (body.layout_json && !layout) {
      return NextResponse.json({ error: "layout_json inválido" }, { status: 400 });
    }

    try {
      const template = await updatePrintTemplate(id, {
        name: body.name?.trim(),
        slug: body.slug,
        page_width_mm: body.page_width_mm,
        page_height_mm: body.page_height_mm,
        layout_json: layout ?? undefined,
        cut_layer_enabled: body.cut_layer_enabled,
        is_default: body.is_default,
      });

      if (!template) {
        return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
      }

      return NextResponse.json({ template });
    } catch (error) {
      console.error("[print-templates PATCH]", error);
      return NextResponse.json({ error: "Error al actualizar plantilla" }, { status: 500 });
    }
  },
);

export const DELETE = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context) => {
    const params = await context.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const existing = await getPrintTemplateById(id);
    if (!existing) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    if (existing.is_default) {
      return NextResponse.json(
        { error: "No se puede eliminar la plantilla predeterminada" },
        { status: 400 },
      );
    }

    const deleted = await deletePrintTemplate(id);
    if (!deleted) {
      return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  },
);
