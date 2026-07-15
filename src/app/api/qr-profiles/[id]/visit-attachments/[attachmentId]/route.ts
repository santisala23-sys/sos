import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getVisitAttachmentForTutor } from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: petId, attachmentId } = await params;
  if (!isUuid(petId) || !isUuid(attachmentId)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const file = await getVisitAttachmentForTutor(
    petId,
    session.userId,
    attachmentId,
  );
  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const bytes = Buffer.from(file.data_b64, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `inline; filename="${encodeURIComponent(file.filename)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
