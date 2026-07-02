import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { listActivationsByBatch } from "@/lib/db/queries-activation";
import { getActivationUrl } from "@/lib/activation/codes";
import { getPublicProfileUrl } from "@/lib/utils/slug";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const params = await context.params;
    const batchId = params?.id;
    if (!batchId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const activations = await listActivationsByBatch(batchId);
    const { searchParams } = new URL(request.url);

    if (searchParams.get("format") === "csv") {
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

    return NextResponse.json({ activations });
  },
);
