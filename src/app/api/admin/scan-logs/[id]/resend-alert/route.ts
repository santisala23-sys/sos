import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { findAdminScanLogById } from "@/lib/db/queries";
import { logSecurityAudit } from "@/lib/security/audit";

type RouteContext = { params: Promise<{ id: string }> };

export const POST = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const log = await findAdminScanLogById(id);
    if (!log) {
      return NextResponse.json({ error: "Escaneo no encontrado" }, { status: 404 });
    }

    try {
      await notifyTutor({
        tutorId: log.tutor_id,
        type: log.alert_type,
        beneficiaryName: log.beneficiary_name,
        emergencyContactName: log.emergency_contact_name,
        emergencyContactPhone: log.emergency_contact_phone,
        scannedAt: log.scanned_at,
        scanLogId: log.id,
        latitude: log.latitude != null ? Number(log.latitude) : null,
        longitude: log.longitude != null ? Number(log.longitude) : null,
        scannerNote: log.scanner_note,
      });
    } catch (error) {
      console.error("[admin/resend-alert]", error);
      return NextResponse.json(
        { error: "Error al reenviar alerta" },
        { status: 500 },
      );
    }

    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: { action: "resend_alert", scanLogId: id },
    });

    return NextResponse.json({
      ok: true,
      pushSubscriptionCount: log.push_subscription_count,
    });
  },
);
