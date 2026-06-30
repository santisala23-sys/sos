import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getClinicalPdfBySlug } from "@/lib/db/queries";
import {
  authorizeScannerFromToken,
  denyScanner,
} from "@/lib/security/scanner-auth";
import { logSecurityAudit } from "@/lib/security/audit";
import { getScanTokenFromRequest } from "@/lib/security/scan-token";

type RouteContext = { params: Promise<{ slug: string }> };

export const GET = withApi(
  { rateLimit: "api" },
  async (request, context, meta) => {
    const { slug } = await (context.params as RouteContext["params"]);
    const scanToken = getScanTokenFromRequest(request);

    if (!scanToken) {
      await logSecurityAudit({
        eventType: "pdf_access_denied",
        ipHash: meta.ipHash,
        details: { slug, reason: "no_token" },
      });
      return NextResponse.json(
        { error: "Sesión de escaneo requerida para descargar el PDF" },
        { status: 401 },
      );
    }

    const access = await authorizeScannerFromToken(scanToken, meta.ipHash);
    if (!access || access.slug !== slug) {
      await logSecurityAudit({
        eventType: "pdf_access_denied",
        ipHash: meta.ipHash,
        details: { slug, reason: "invalid_token" },
      });
      return denyScanner(meta.ipHash, "pdf_access_denied");
    }

    const pdf = await getClinicalPdfBySlug(slug);
    if (!pdf) {
      return NextResponse.json({ error: "PDF no disponible" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(pdf.data), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdf.filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
);
