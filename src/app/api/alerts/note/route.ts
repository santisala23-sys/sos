import { NextResponse } from "next/server";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { addScanMessage, findScanLogBySlugAccess } from "@/lib/db/queries";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { scanLogId, note, slug } = body as {
      scanLogId?: string;
      note?: string;
      slug?: string;
    };

    if (!scanLogId || !note?.trim()) {
      return NextResponse.json(
        { error: "scanLogId y note son requeridos" },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json({ error: "slug requerido" }, { status: 400 });
    }

    const access = await findScanLogBySlugAccess(scanLogId, slug);
    if (!access) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    }

    await addScanMessage(scanLogId, "public", note);

    await notifyTutor({
      tutorId: access.tutor_id,
      type: "message",
      beneficiaryName: access.beneficiary_name,
      emergencyContactName: "",
      emergencyContactPhone: "",
      scannedAt: access.scanned_at,
      scanLogId,
      latitude: access.latitude,
      longitude: access.longitude,
      scannerNote: note.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[alerts/note]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
