import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { generateSingleQrLabel } from "@/lib/activation/batch-export";
import {
  isExportTemplateKey,
  type ExportTemplateKey,
} from "@/lib/activation/export-templates";
import { findAdminProfileById } from "@/lib/db/queries";
import { getPublicProfileUrl } from "@/lib/utils/slug";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context) => {
    const { id } = await (context.params as RouteContext["params"]);
    const profile = await findAdminProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const templateParam = searchParams.get("template") ?? "minimal";
    const output = searchParams.get("output") ?? "png";

    if (!isExportTemplateKey(templateParam)) {
      return NextResponse.json(
        { error: "Plantilla de formato inválida" },
        { status: 400 },
      );
    }

    const template = templateParam as ExportTemplateKey;
    const label =
      profile.activation_code ??
      profile.beneficiary_name.slice(0, 24) ??
      profile.slug.slice(0, 12);

    const result = await generateSingleQrLabel({
      url: getPublicProfileUrl(profile.slug),
      label,
      template,
    });

    if (output === "svg") {
      return new NextResponse(result.svg, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="${result.filenameBase}.svg"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(new Uint8Array(result.png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${result.filenameBase}.png"`,
        "Cache-Control": "no-store",
      },
    });
  },
);
