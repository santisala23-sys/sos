import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findQrProfileById, listObjectSavedLocations } from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const profile = await findQrProfileById(id);
  if (!profile || profile.tutor_id !== session.userId) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (profile.profile_type !== "object") {
    return NextResponse.json(
      { error: "Solo aplica a perfiles de objeto" },
      { status: 400 },
    );
  }

  const locations = await listObjectSavedLocations(id);
  return NextResponse.json({ locations });
}
