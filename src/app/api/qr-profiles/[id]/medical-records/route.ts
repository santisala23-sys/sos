import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import {
  insertVisitByTutor,
  listPetVetVisits,
  listPetVetVisitsForTutor,
  listPreventiveItems,
  listPreventiveItemsForTutor,
} from "@/lib/db/queries-pet-medical";
import { canEditProfile, canViewHealthBook } from "@/lib/profile-access";
import { isUuid } from "@/lib/pet-medical";
import { parseVisitBody } from "@/lib/pet-visit-validate";

type RouteContext = { params: Promise<{ id: string }> };

/** Lista visitas + vacunas/desparasitaciones (tutor). */
export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId } = await params;
  if (!isUuid(petId)) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }

  const access = await requireProfileAccess(petId, session.userId);
  if (access instanceof NextResponse) return access;
  if (access.profile.profile_type !== "pet") {
    return NextResponse.json(
      { error: "Perfil de mascota no encontrado" },
      { status: 404 },
    );
  }
  if (!canViewHealthBook(access)) {
    return accessDenied("No tenés permiso para ver la libreta sanitaria");
  }

  try {
    const [visits, preventive] =
      access.kind === "owner"
        ? await Promise.all([
            listPetVetVisitsForTutor(petId, session.userId),
            listPreventiveItemsForTutor(petId, session.userId),
          ])
        : await Promise.all([
            listPetVetVisits(petId),
            listPreventiveItems(petId),
          ]);
    if (visits === null || preventive === null) {
      return NextResponse.json(
        { error: "Perfil de mascota no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      visits,
      records: visits,
      preventive,
      readOnly: access.kind === "shared" && !canEditProfile(access),
    });
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

  const access = await requireProfileAccess(petId, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canEditProfile(access)) {
    return accessDenied("No tenés permiso para editar la libreta sanitaria");
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
    const message =
      error instanceof Error ? error.message : "Error interno";
    console.error("[medical-records POST]", error);
    const status =
      message.includes("MB") ||
      message.includes("permitido") ||
      message.includes("Máximo") ||
      message.includes("vacío")
        ? 400
        : 500;
    return NextResponse.json(
      { error: status === 400 ? message : "Error interno" },
      { status },
    );
  }
}
