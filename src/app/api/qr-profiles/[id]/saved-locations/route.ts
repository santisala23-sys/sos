import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import { listObjectSavedLocations, saveObjectProfileLocation } from "@/lib/db/queries";
import { canSaveLocation, canViewProfile } from "@/lib/profile-access";

type RouteContext = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (access.profile.profile_type !== "object") {
    return NextResponse.json(
      { error: "Solo aplica a perfiles de objeto" },
      { status: 400 },
    );
  }
  if (!canViewProfile(access) && !canSaveLocation(access)) {
    return accessDenied("No tenés permiso para ver ubicaciones guardadas");
  }

  const locations = await listObjectSavedLocations(id);
  return NextResponse.json({ locations });
}

/** Guarda la ubicación actual del tutor como última pin del objeto. */
export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (access.profile.profile_type !== "object") {
    return NextResponse.json(
      { error: "Solo aplica a perfiles de objeto" },
      { status: 400 },
    );
  }
  if (!canSaveLocation(access)) {
    return accessDenied("No tenés permiso para guardar ubicación");
  }

  const body = await request.json().catch(() => ({}));
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
    access.profile.slug,
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
}
