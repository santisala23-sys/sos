import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  buildBatchExportZipBuffer,
  detectExportTemplate,
  generateBatchExportFiles,
  isExportTemplateKey,
} from "@/lib/activation/batch-export";
import { getActivationUrl } from "@/lib/activation/codes";
import {
  getProductBatchById,
  listActivationsByBatch,
} from "@/lib/db/queries-activation";
import { getAppUrl } from "@/lib/utils/app-url";
import { getPublicProfileUrl } from "@/lib/utils/slug";

export const maxDuration = 60;

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const batchId = params?.id;
    if (!batchId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const batch = await getProductBatchById(batchId);
    if (!batch) {
      return NextResponse.json({ error: "Lote no encontrado" }, { status: 404 });
    }

    const activations = await listActivationsByBatch(batchId);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");

    if (format === "csv") {
      const header =
        "activation_code,activation_url,public_slug,profile_url,status,claimed_at\n";
      const rows = activations
        .map((a) => {
          const slug = a.public_slug ?? "";
          const fields = [
            a.activation_code,
            getActivationUrl(a.activation_code),
            slug,
            slug ? getPublicProfileUrl(slug) : "",
            a.status,
            a.claimed_at ?? "",
          ];
          return fields
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",");
        })
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="lote-${batchId.slice(0, 8)}.csv"`,
        },
      });
    }

    if (format === "zip") {
      const templateParam = searchParams.get("template");
      const template =
        templateParam && isExportTemplateKey(templateParam)
          ? templateParam
          : detectExportTemplate(batch.product_label);
      const onlyUnclaimed = searchParams.get("only_unclaimed") === "1";

      try {
        const exportResult = await generateBatchExportFiles({
          batch,
          activations,
          appUrl: getAppUrl(),
          template,
          onlyUnclaimed,
        });
        const zipBuffer = await buildBatchExportZipBuffer(exportResult);
        const slug = batch.product_label
          ? batch.product_label.toLowerCase().replace(/[^a-z0-9]+/g, "-")
          : template;

        return new NextResponse(new Uint8Array(zipBuffer), {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="sosme-lote-${batchId.slice(0, 8)}-${slug}.zip"`,
          },
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al exportar lote";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json({ activations, batch });
  },
);
