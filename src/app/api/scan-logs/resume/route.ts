import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { findScanLogBySlugAccess } from "@/lib/db/queries";
import { SCAN_SESSION_TTL_MS } from "@/lib/scan-session/storage";
import {
  authorizeScannerFromToken,
  denyScanner,
} from "@/lib/security/scanner-auth";
import { verifyScanToken } from "@/lib/security/scan-token";

export const GET = withApi(
  { rateLimit: "api" },
  async (request, _ctx, meta) => {
    const { searchParams } = new URL(request.url);
    const scanToken = searchParams.get("scanToken");

    if (!scanToken) {
      return NextResponse.json(
        { error: "scanToken es requerido" },
        { status: 400 },
      );
    }

    const access = await authorizeScannerFromToken(scanToken, meta.ipHash);
    if (!access) {
      return denyScanner(meta.ipHash, "resume_invalid");
    }

    const log = await findScanLogBySlugAccess(access.scanLogId, access.slug);
    if (!log) {
      return NextResponse.json({ valid: false });
    }

    const ageMs = Date.now() - new Date(log.scanned_at).getTime();
    if (ageMs > SCAN_SESSION_TTL_MS) {
      return NextResponse.json({ valid: false, reason: "expired" });
    }

    const payload = await verifyScanToken(scanToken);
    if (!payload) {
      return NextResponse.json({ valid: false, reason: "token_expired" });
    }

    return NextResponse.json({
      valid: true,
      scanLogId: log.id,
      scanToken,
      scannedAt: log.scanned_at,
      latitude: log.latitude != null ? Number(log.latitude) : null,
      longitude: log.longitude != null ? Number(log.longitude) : null,
      alertType: log.alert_type,
    });
  },
);
