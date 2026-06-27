import { NextResponse } from "next/server";
import {
  buildAlertMessage,
  sendFamilyAlert,
} from "@/lib/alerts/send-alert";
import {
  createScanLog,
  findActiveQrProfileById,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, userAgent } = body as {
      profileId?: string;
      userAgent?: string;
    };

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId es requerido" },
        { status: 400 },
      );
    }

    const profile = await findActiveQrProfileById(profileId);
    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado o inactivo" },
        { status: 404 },
      );
    }

    const scanLog = await createScanLog({
      profile_id: profileId,
      user_agent: userAgent ?? null,
      alert_type: "scan",
    });

    const { message, dashboardUrl, mapsUrl } = buildAlertMessage({
      type: "scan",
      beneficiaryName: profile.beneficiary_name,
      scanLogId: scanLog.id,
    });

    await sendFamilyAlert({
      type: "scan",
      beneficiaryName: profile.beneficiary_name,
      emergencyContactName: profile.emergency_contact_name,
      emergencyContactPhone: profile.emergency_contact_phone,
      scannedAt: scanLog.scanned_at,
      scanLogId: scanLog.id,
      message,
      dashboardUrl,
      mapsUrl,
    });

    return NextResponse.json({ scanLogId: scanLog.id });
  } catch (error) {
    console.error("[alerts/scan]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
