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

async function authorizeScanLogAccess(
  scanLogId: string,
  slug: string | null,
): Promise<"public" | "tutor" | null> {
  if (slug) {
    const access = await findScanLogBySlugAccess(scanLogId, slug);
    if (access) return "public";
  }

  const session = await getSession();
  if (session) {
    const log = await findScanLogForTutor(scanLogId, session.userId);
    if (log) return "tutor";
  }

  return null;
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const access = await authorizeScanLogAccess(id, slug);
  if (!access) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
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

    const access = await authorizeScanLogAccess(id, slug ?? null);
    if (!access) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (access === "public") {
      const created = await addScanMessage(id, "public", message);
      if (!created) {
        return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
      }

      try {
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
      } catch (notifyError) {
        console.error("[scan-messages POST] notify tutor:", notifyError);
      }

      return NextResponse.json({ message: created });
    }

    const log = await findScanLogForTutor(id, (await getSession())!.userId);
    if (!log) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const created = await addScanMessage(id, "tutor", message);
    if (!created) {
      return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
    }

    try {
      await notifyScanner({
        scanLogId: id,
        slug: log.slug,
        body: message.trim(),
      });
    } catch (notifyError) {
      console.error("[scan-messages POST] notify scanner:", notifyError);
    }

    return NextResponse.json({ message: created });
  } catch (error) {
    console.error("[scan-messages POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
