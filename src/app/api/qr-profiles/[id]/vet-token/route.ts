import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createVetAccessToken } from "@/lib/db/queries-pet-medical";
import { getAppUrl } from "@/lib/utils/app-url";
import { isUuid } from "@/lib/pet-medical";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId } = await params;
  if (!isUuid(petId)) {
    return NextResponse.json({ error: "Perfil inválido" }, { status: 400 });
  }

  try {
    const tokenRow = await createVetAccessToken(petId, session.userId);
    if (!tokenRow) {
      return NextResponse.json(
        {
          error:
            "Solo podés compartir perfiles de mascota activos que te pertenecen",
        },
        { status: 404 },
      );
    }

    const url = `${getAppUrl()}/vet-view/${tokenRow.token}`;

    return NextResponse.json({
      token: tokenRow.token,
      url,
      expires_at: tokenRow.expires_at,
    });
  } catch (error) {
    console.error("[vet-token POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
