import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  findScanLogForTutor,
  markScanLogRead,
} from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const log = await findScanLogForTutor(id, session.userId);

  if (!log) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ log });
}

export async function PATCH(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await markScanLogRead(id, session.userId);

  if (!ok) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
