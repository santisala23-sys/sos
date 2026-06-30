import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { listApiRequestLogs } from "@/lib/db/queries";

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request) => {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100), 500);
    const offset = Number(searchParams.get("offset") ?? 0);
    const errorsOnly = searchParams.get("errors") === "1";
    const logs = await listApiRequestLogs(limit, offset, errorsOnly);
    return NextResponse.json({ logs });
  },
);
