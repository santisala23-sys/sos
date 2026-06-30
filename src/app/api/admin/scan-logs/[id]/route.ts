import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  adminSetScanLogRead,
  findAdminScanLogById,
} from "@/lib/db/queries";
import { logSecurityAudit } from "@/lib/security/audit";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context) => {
    const { id } = await (context.params as RouteContext["params"]);
    const log = await findAdminScanLogById(id);
    if (!log) {
      return NextResponse.json({ error: "Escaneo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ log });
  },
);

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const body = await request.json();
    const { read } = body as { read?: boolean };

    if (read === undefined) {
      return NextResponse.json({ error: "read es requerido" }, { status: 400 });
    }

    const ok = await adminSetScanLogRead(id, read);
    if (!ok) {
      return NextResponse.json({ error: "Escaneo no encontrado" }, { status: 404 });
    }

    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: { action: "update_scan_log", scanLogId: id, read },
    });

    const log = await findAdminScanLogById(id);
    return NextResponse.json({ log });
  },
);
