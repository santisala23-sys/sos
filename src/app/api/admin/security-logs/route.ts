import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { listSecurityAuditLogs } from "@/lib/db/queries";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
    const offset = Number(searchParams.get("offset") ?? 0);
    const logs = await listSecurityAuditLogs(limit, offset);
    return NextResponse.json({ logs });
  },
);
