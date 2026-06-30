import { NextResponse } from "next/server";
import { findScanLogBySlugAccess } from "@/lib/db/queries";
import { SCAN_SESSION_TTL_MS } from "@/lib/scan-session/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const scanLogId = searchParams.get("scanLogId");

  if (!slug || !scanLogId) {
    return NextResponse.json(
      { error: "slug y scanLogId son requeridos" },
      { status: 400 },
    );
  }

  const log = await findScanLogBySlugAccess(scanLogId, slug);
  if (!log) {
    return NextResponse.json({ valid: false });
  }

  const ageMs = Date.now() - new Date(log.scanned_at).getTime();
  if (ageMs > SCAN_SESSION_TTL_MS) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  return NextResponse.json({
    valid: true,
    scanLogId: log.id,
    scannedAt: log.scanned_at,
    latitude: log.latitude != null ? Number(log.latitude) : null,
    longitude: log.longitude != null ? Number(log.longitude) : null,
    alertType: log.alert_type,
  });
}
