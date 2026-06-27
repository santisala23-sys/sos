import { NextResponse } from "next/server";
import {
  buildAlertMessage,
  sendFamilyAlert,
} from "@/lib/alerts/send-alert";
import { findScanLogById, updateScanLogLocation } from "@/lib/db/queries";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { scanLogId, latitude, longitude } = body as {
      scanLogId?: string;
      latitude?: number;
      longitude?: number;
    };

    if (!scanLogId || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "scanLogId, latitude y longitude son requeridos" },
        { status: 400 },
      );
    }

    const result = await updateScanLogLocation(scanLogId, latitude, longitude);
    if (!result) {
      return NextResponse.json(
        { error: "Registro de escaneo no encontrado" },
        { status: 404 },
      );
    }

    const fullLog = await findScanLogById(scanLogId);

    const { message, dashboardUrl, mapsUrl } = buildAlertMessage({
      type: "location",
      beneficiaryName: result.beneficiary_name,
      scanLogId,
      latitude,
      longitude,
      scannerNote: fullLog?.scanner_note,
    });

    await sendFamilyAlert({
      type: "location",
      beneficiaryName: result.beneficiary_name,
      emergencyContactName: result.emergency_contact_name,
      emergencyContactPhone: result.emergency_contact_phone,
      scannedAt: result.scanned_at,
      latitude,
      longitude,
      scanLogId,
      scannerNote: fullLog?.scanner_note,
      message,
      dashboardUrl,
      mapsUrl,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[alerts/location]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
