import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  insertPreventiveItemForTutor,
  listPreventiveItemsForTutor,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parsePreventiveBody } from "@/lib/pet-visit-validate";

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

  const items = await listPreventiveItemsForTutor(petId, session.userId);
  if (items === null) {
    return NextResponse.json(
      { error: "Perfil de mascota no encontrado" },
      { status: 404 },
    );
  }
  return NextResponse.json({ items });
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

  const parsed = parsePreventiveBody(body, { requireKind: true });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const item = await insertPreventiveItemForTutor(petId, session.userId, {
    kind: parsed.data.kind!,
    name: parsed.data.name,
    last_applied_at: parsed.data.last_applied_at,
    next_due_at: parsed.data.next_due_at,
    notes: parsed.data.notes,
  });

  if (!item) {
    return NextResponse.json(
      { error: "Perfil de mascota no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ item }, { status: 201 });
}
