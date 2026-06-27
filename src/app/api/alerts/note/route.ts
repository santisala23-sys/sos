import { NextResponse } from "next/server";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { addScannerNote } from "@/lib/db/queries";
import { findQrProfileById } from "@/lib/db/queries";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { scanLogId, note } = body as {
      scanLogId?: string;
      note?: string;
    };

    if (!scanLogId || !note?.trim()) {
      return NextResponse.json(
        { error: "scanLogId y note son requeridos" },
        { status: 400 },
      );
    }

    const updated = await addScannerNote(scanLogId, note);
    if (!updated) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 },
      );
    }

    const profile = await findQrProfileById(updated.profile_id);
    if (!profile) {
      return NextResponse.json({ ok: true });
    }

    await notifyTutor({
      tutorId: profile.tutor_id,
      type: "note",
      beneficiaryName: updated.beneficiary_name,
      emergencyContactName: updated.emergency_contact_name,
      emergencyContactPhone: updated.emergency_contact_phone,
      scannedAt: updated.scanned_at,
      scanLogId,
      latitude: updated.latitude,
      longitude: updated.longitude,
      scannerNote: updated.scanner_note,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[alerts/note]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
