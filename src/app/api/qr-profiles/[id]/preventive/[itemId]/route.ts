import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  deletePreventiveItemForTutor,
  updatePreventiveItemForTutor,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parsePreventiveBody } from "@/lib/pet-visit-validate";

type RouteContext = { params: Promise<{ id: string; itemId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId, itemId } = await params;
  if (!isUuid(petId) || !isUuid(itemId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = parsePreventiveBody(body, { requireKind: false });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const item = await updatePreventiveItemForTutor(
    petId,
    session.userId,
    itemId,
    {
      name: parsed.data.name,
      last_applied_at: parsed.data.last_applied_at,
      next_due_at: parsed.data.next_due_at,
      notes: parsed.data.notes,
    },
  );

  if (!item) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId, itemId } = await params;
  if (!isUuid(petId) || !isUuid(itemId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const ok = await deletePreventiveItemForTutor(petId, session.userId, itemId);
  if (!ok) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
