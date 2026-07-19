import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { saveObjectProfileLocation } from "@/lib/db/queries";

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

type RouteContext = { params: Promise<{ slug: string }> };

export const POST = withApi(
  { rateLimit: "alerts" },
  async (request, context) => {
    const { slug: rawSlug } = await (context.params as RouteContext["params"]);
    const slug = rawSlug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "slug es requerido" }, { status: 400 });
    }

    const body = await request.json();
    const { latitude, longitude } = body as {
      latitude?: number;
      longitude?: number;
    };

    if (
      latitude == null ||
      longitude == null ||
      !isValidCoord(Number(latitude), Number(longitude))
    ) {
      return NextResponse.json(
        { error: "latitude y longitude válidos son requeridos" },
        { status: 400 },
      );
    }

    const result = await saveObjectProfileLocation(
      slug,
      Number(latitude),
      Number(longitude),
    );

    if (!result) {
      return NextResponse.json(
        { error: "Perfil de objeto no encontrado o inactivo" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      saved_location_at: result.saved_location_at,
    });
  },
);
