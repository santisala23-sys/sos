import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { createScanLog, findQrProfileBySlug } from "@/lib/db/queries";
import {
  formatApproximateArea,
  getApproximateGeoFromRequest,
} from "@/lib/security/request-geo";
import { createScanToken } from "@/lib/security/scan-token";

export const POST = withApi(
  { rateLimit: "alerts" },
  async (request) => {
    const body = await request.json();
    const { slug, userAgent } = body as {
      slug?: string;
      userAgent?: string;
    };

    if (!slug?.trim()) {
      return NextResponse.json({ error: "slug es requerido" }, { status: 400 });
    }

    const profile = await findQrProfileBySlug(slug.trim(), true);
    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado o inactivo" },
        { status: 404 },
      );
    }

    const approxGeo = getApproximateGeoFromRequest(request);

    const scanLog = await createScanLog({
      profile_id: profile.id,
      user_agent: userAgent ?? null,
      alert_type: "scan",
      latitude: approxGeo?.latitude ?? null,
      longitude: approxGeo?.longitude ?? null,
      location_is_approximate: approxGeo != null,
    });

    const scanToken = await createScanToken({
      scanLogId: scanLog.id,
      slug: profile.slug,
    });

    await notifyTutor({
      tutorId: profile.tutor_id,
      type: "scan",
      beneficiaryName: profile.beneficiary_name,
      emergencyContactName: profile.emergency_contact_name,
      emergencyContactPhone: profile.emergency_contact_phone,
      scannedAt: scanLog.scanned_at,
      scanLogId: scanLog.id,
      latitude: approxGeo?.latitude ?? null,
      longitude: approxGeo?.longitude ?? null,
      locationApproximate: approxGeo != null,
      locationArea: approxGeo ? formatApproximateArea(approxGeo) : null,
    });

    return NextResponse.json({ scanLogId: scanLog.id, scanToken });
  },
);
