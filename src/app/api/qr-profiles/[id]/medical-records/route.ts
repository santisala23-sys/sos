import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  insertVisitByTutor,
  listPetVetVisitsForTutor,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parseVisitBody } from "@/lib/pet-visit-validate";

type RouteContext = { params: Promise<{ id: string }> };

/** Lista visitas de la libreta sanitaria (tutor). */
export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId } = await params;
  if (!isUuid(petId)) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }

  try {
    const visits = await listPetVetVisitsForTutor(petId, session.userId);
    if (visits === null) {
      return NextResponse.json(
        { error: "Perfil de mascota no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ visits, records: visits });
  } catch (error) {
    console.error("[medical-records GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** El tutor carga una visita (sin verificación veterinaria). */
export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId } = await params;
  if (!isUuid(petId)) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = parseVisitBody(body, { requireVetIdentity: false });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const visit = await insertVisitByTutor(petId, session.userId, parsed.data);
    if (!visit) {
      return NextResponse.json(
        { error: "Perfil de mascota no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ visit }, { status: 201 });
  } catch (error) {
    console.error("[medical-records POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
