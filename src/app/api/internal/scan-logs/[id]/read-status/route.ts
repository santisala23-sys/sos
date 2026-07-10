import { NextResponse } from "next/server";
import { getScanLogReadAt } from "@/lib/db/queries";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request, { params }: RouteContext) {
  const expectedKey = process.env.INTERNAL_N8N_KEY;
  if (!expectedKey) {
    return NextResponse.json(
      { error: "Endpoint interno no configurado" },
      { status: 500 },
    );
  }

  const providedKey = request.headers.get("x-n8n-api-key");
  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  try {
    const readAt = await getScanLogReadAt(id);
    if (readAt === undefined) {
      return NextResponse.json(
        { error: "Scan log no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ read_at: readAt });
  } catch (error) {
    console.error("[internal read-status GET]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
