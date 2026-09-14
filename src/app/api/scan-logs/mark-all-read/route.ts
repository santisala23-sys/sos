import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markAllScanLogsReadForUser } from "@/lib/db/queries-profile-shares";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const closedCount = await markAllScanLogsReadForUser(session.userId);
  return NextResponse.json({ ok: true, closedCount });
}
