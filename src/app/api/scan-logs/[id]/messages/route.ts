import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { notifyScanner } from "@/lib/alerts/notify-scanner";
import {
  addScanMessage,
  findScanLogBySlugAccess,
  findScanLogForTutor,
  getScanLogContextForNotify,
  listScanMessages,
} from "@/lib/db/queries";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const session = await getSession();

  if (session) {
    const log = await findScanLogForTutor(id, session.userId);
    if (!log) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  } else if (slug) {
    const access = await findScanLogBySlugAccess(id, slug);
    if (!access) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const messages = await listScanMessages(id);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { message, slug } = body as { message?: string; slug?: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: "message es requerido" }, { status: 400 });
    }

    const session = await getSession();

    if (session) {
      const log = await findScanLogForTutor(id, session.userId);
      if (!log) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }

      const created = await addScanMessage(id, "tutor", message);
      if (!created) {
        return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
      }

      await notifyScanner({
        scanLogId: id,
        slug: log.slug,
        body: message.trim(),
      });

      return NextResponse.json({ message: created });
    }

    if (!slug) {
      return NextResponse.json({ error: "slug requerido" }, { status: 400 });
    }

    const access = await findScanLogBySlugAccess(id, slug);
    if (!access) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const created = await addScanMessage(id, "public", message);
    if (!created) {
      return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
    }

    const ctx = await getScanLogContextForNotify(id);
    if (ctx) {
      await notifyTutor({
        tutorId: ctx.tutor_id,
        type: "message",
        beneficiaryName: ctx.beneficiary_name,
        emergencyContactName: ctx.emergency_contact_name,
        emergencyContactPhone: ctx.emergency_contact_phone,
        scannedAt: ctx.scanned_at,
        scanLogId: id,
        latitude: ctx.latitude,
        longitude: ctx.longitude,
        scannerNote: message.trim(),
      });
    }

    return NextResponse.json({ message: created });
  } catch (error) {
    console.error("[scan-messages POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
