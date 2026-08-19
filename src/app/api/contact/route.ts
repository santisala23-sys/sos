import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { findContactInfoBySlug } from "@/lib/db/public-queries";
import { buildContactLinksResponse } from "@/lib/public-profile/contact-links";
import { isValidProfileSlug } from "@/lib/utils/slug";

type ContactRequestBody = {
  slug?: string;
  alertType?: "scan" | "sos" | "general";
  latitude?: number | null;
  longitude?: number | null;
  scannerNote?: string | null;
  scanLogId?: string | null;
};

export const POST = withApi(
  { rateLimit: "contact" },
  async (request) => {
    let body: ContactRequestBody;
    try {
      body = (await request.json()) as ContactRequestBody;
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug es requerido" }, { status: 400 });
    }
    if (!isValidProfileSlug(slug)) {
      return NextResponse.json({ error: "slug inválido" }, { status: 400 });
    }

    const row = await findContactInfoBySlug(slug);
    if (!row) {
      return NextResponse.json(
        { error: "Perfil no encontrado o inactivo" },
        { status: 404 },
      );
    }

    const links = buildContactLinksResponse(row, {
      alertType: body.alertType ?? "general",
      latitude: body.latitude,
      longitude: body.longitude,
      scannerNote: body.scannerNote,
      scanLogId: body.scanLogId,
    });

    return NextResponse.json(links);
  },
);
