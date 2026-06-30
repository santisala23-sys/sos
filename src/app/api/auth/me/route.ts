import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserLegalStatus } from "@/lib/db/queries";
import { getLegalStatus } from "@/lib/legal/status";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const legal = await findUserLegalStatus(session.userId);

  return NextResponse.json({
    email: session.email,
    legal: getLegalStatus(legal),
  });
}
