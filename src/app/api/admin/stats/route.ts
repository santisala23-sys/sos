import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  getAdminApiTimeSeries,
  getAdminOverviewStats,
  getAdminScanTimeSeries,
  getAdminStatusBreakdown,
  getAdminTopEndpoints,
} from "@/lib/db/queries";
import { logSecurityAudit } from "@/lib/security/audit";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, _ctx, meta) => {
    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: { section: "stats" },
    });

    const [overview, scanSeries, apiSeries, topEndpoints, statusBreakdown] =
      await Promise.all([
        getAdminOverviewStats(),
        getAdminScanTimeSeries(14),
        getAdminApiTimeSeries(24),
        getAdminTopEndpoints(12),
        getAdminStatusBreakdown(),
      ]);

    return NextResponse.json({
      overview,
      scanSeries,
      apiSeries,
      topEndpoints,
      statusBreakdown,
    });
  },
);
