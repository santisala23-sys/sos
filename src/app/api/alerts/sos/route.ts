import { NextResponse } from "next/server";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import {
  createScanLog,
  findActiveQrProfileById,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profileId, userAgent, latitude, longitude } = body as {
      profileId?: string;
      userAgent?: string;
      latitude?: number | null;
      longitude?: number | null;
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
      alert_type: "sos",
      latitude: latitude ?? null,
      longitude: longitude ?? null,
    });

    await notifyTutor({
      tutorId: profile.tutor_id,
      type: "sos",
      beneficiaryName: profile.beneficiary_name,
      emergencyContactName: profile.emergency_contact_name,
      emergencyContactPhone: profile.emergency_contact_phone,
      scannedAt: scanLog.scanned_at,
      scanLogId: scanLog.id,
      latitude,
      longitude,
    });

    return NextResponse.json({ scanLogId: scanLog.id });
  } catch (error) {
    console.error("[alerts/sos]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
