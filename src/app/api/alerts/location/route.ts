import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import {
  findQrProfileById,
  findScanLogById,
  updateScanLogLocation,
} from "@/lib/db/queries";
import {
  authorizeScannerFromToken,
  denyScanner,
} from "@/lib/security/scanner-auth";
import { getScanTokenFromRequest } from "@/lib/security/scan-token";

export const PATCH = withApi(
  { rateLimit: "alerts" },
  async (request, _ctx, meta) => {
    const scanToken = getScanTokenFromRequest(request);
    if (!scanToken) {
      return NextResponse.json({ error: "Token de sesión requerido" }, { status: 401 });
    }

    const access = await authorizeScannerFromToken(scanToken, meta.ipHash);
    if (!access) {
      return denyScanner(meta.ipHash, "location_no_access");
    }

    const body = await request.json();
    const { latitude, longitude } = body as {
      latitude?: number;
      longitude?: number;
    };

    if (latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "latitude y longitude son requeridos" },
        { status: 400 },
      );
    }

    const result = await updateScanLogLocation(
      access.scanLogId,
      latitude,
      longitude,
    );
    if (!result) {
      return NextResponse.json(
        { error: "Registro de escaneo no encontrado" },
        { status: 404 },
      );
    }

    const fullLog = await findScanLogById(access.scanLogId);
    const profile = await findQrProfileById(result.profile_id);
    if (!profile) {
      return NextResponse.json({ ok: true });
    }

    await notifyTutor({
      tutorId: profile.tutor_id,
      type: "location",
      beneficiaryName: result.beneficiary_name,
      emergencyContactName: result.emergency_contact_name,
      emergencyContactPhone: result.emergency_contact_phone,
      scannedAt: result.scanned_at,
      scanLogId: access.scanLogId,
      latitude,
      longitude,
      scannerNote: fullLog?.scanner_note,
    });

    return NextResponse.json({ ok: true });
  },
);
