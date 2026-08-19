import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  insertPetWeightEntryForTutor,
  listPetWeightEntriesForTutor,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parseWeightKg } from "@/lib/pet-weight-validate";

type RouteContext = { params: Promise<{ id: string }> };

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
    const entries = await listPetWeightEntriesForTutor(petId, session.userId);
    if (entries === null) {
      return NextResponse.json(
        { error: "Perfil de mascota no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[weight-entries GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const weightKg = parseWeightKg(raw.weight_kg);
  if (weightKg === null) {
    return NextResponse.json(
      { error: "Peso inválido (usá un valor entre 0.1 y 200 kg)" },
      { status: 400 },
    );
  }

  const notes =
    typeof raw.notes === "string" ? raw.notes.trim().slice(0, 500) : "";

  try {
    const entry = await insertPetWeightEntryForTutor(petId, session.userId, {
      weight_kg: weightKg,
      notes,
    });
    if (!entry) {
      return NextResponse.json(
        { error: "Perfil de mascota no encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("[weight-entries POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
