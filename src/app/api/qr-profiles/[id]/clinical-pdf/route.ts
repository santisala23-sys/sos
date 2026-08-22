import { NextResponse } from "next/server";

const gone = () =>
  NextResponse.json(
    {
      error:
        "El PDF clínico ya no se carga en el perfil QR. Usá la libreta sanitaria para el historial clínico.",
    },
    { status: 410 },
  );

export async function GET() {
  return gone();
}

export async function POST() {
  return gone();
}

export async function DELETE() {
  return gone();
}
