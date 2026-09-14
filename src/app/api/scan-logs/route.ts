import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  countUnreadScanLogsForUser,
  listScanLogsForUser,
} from "@/lib/db/queries-profile-shares";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [logs, unreadCount] = await Promise.all([
    listScanLogsForUser(session.userId),
    countUnreadScanLogsForUser(session.userId),
  ]);

  return NextResponse.json({ logs, unreadCount });
}
