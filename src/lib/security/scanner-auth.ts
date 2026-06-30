import { NextResponse } from "next/server";
import { findScanLogBySlugAccess } from "@/lib/db/queries";
import {
  getScanTokenFromRequest,
  verifyScanToken,
  type ScanTokenPayload,
} from "@/lib/security/scan-token";
import { logSecurityAudit } from "@/lib/security/audit";

export type ScannerAccess = ScanTokenPayload & {
  tutorId: string;
  beneficiaryName: string;
};

export async function authorizeScannerAccess(
  request: Request,
  scanLogId: string,
  slugFromQuery?: string | null,
): Promise<ScannerAccess | null> {
  const token =
    getScanTokenFromRequest(request) ??
    (slugFromQuery ? null : null);

  if (token) {
    const payload = await verifyScanToken(token);
    if (!payload || payload.scanLogId !== scanLogId) {
      return null;
    }
    const log = await findScanLogBySlugAccess(payload.scanLogId, payload.slug);
    if (!log) return null;
    return {
      ...payload,
      tutorId: log.tutor_id,
      beneficiaryName: log.beneficiary_name,
    };
  }

  if (slugFromQuery) {
    const log = await findScanLogBySlugAccess(scanLogId, slugFromQuery);
    if (!log) return null;
    return {
      scanLogId,
      slug: slugFromQuery,
      kind: "scanner_session",
      tutorId: log.tutor_id,
      beneficiaryName: log.beneficiary_name,
    };
  }

  return null;
}

export async function authorizeScannerFromToken(
  scanToken: string,
  ipHash?: string | null,
): Promise<ScannerAccess | null> {
  const payload = await verifyScanToken(scanToken);
  if (!payload) {
    await logSecurityAudit({
      eventType: "invalid_scan_token",
      ipHash,
      details: { reason: "invalid_or_expired" },
    });
    return null;
  }

  const log = await findScanLogBySlugAccess(payload.scanLogId, payload.slug);
  if (!log) return null;

  return {
    ...payload,
    tutorId: log.tutor_id,
    beneficiaryName: log.beneficiary_name,
  };
}

export async function denyScanner(
  ipHash: string | null,
  reason: string,
): Promise<NextResponse> {
  await logSecurityAudit({
    eventType: "invalid_scan_token",
    ipHash,
    details: { reason },
  });
  return NextResponse.json({ error: "Sesión no válida" }, { status: 403 });
}
