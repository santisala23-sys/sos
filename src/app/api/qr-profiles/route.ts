import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listQrProfilesByTutor } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const profiles = await listQrProfilesByTutor(session.userId);
  return NextResponse.json({ profiles });
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Para agregar un perfil tenés que activar un producto SOSme escaneando su QR.",
      code: "ACTIVATION_REQUIRED",
    },
    { status: 403 },
  );
}
