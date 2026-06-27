import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  countUnreadScanLogs,
  listScanLogsByTutor,
} from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [logs, unreadCount] = await Promise.all([
    listScanLogsByTutor(session.userId),
    countUnreadScanLogs(session.userId),
  ]);

  return NextResponse.json({ logs, unreadCount });
}
