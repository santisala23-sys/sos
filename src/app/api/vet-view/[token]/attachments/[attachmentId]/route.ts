import { NextResponse } from "next/server";
import { getVisitAttachmentByVetToken } from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { withApi } from "@/lib/api/with-api";

type RouteContext = {
  params: Promise<{ token: string; attachmentId: string }>;
};

export const GET = withApi({ rateLimit: "api" }, async (_request, context) => {
  const { token, attachmentId } = await (context.params as RouteContext["params"]);

  if (!token || !isUuid(token) || !isUuid(attachmentId)) {
    return NextResponse.json(
      { error: "Enlace o archivo inválido" },
      { status: 404 },
    );
  }

  const file = await getVisitAttachmentByVetToken(token, attachmentId);
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
});
