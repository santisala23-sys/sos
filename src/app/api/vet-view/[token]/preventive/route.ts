import { NextResponse } from "next/server";
import { insertPreventiveItemByVet } from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parsePreventiveBody } from "@/lib/pet-visit-validate";
import { withApi } from "@/lib/api/with-api";

type RouteContext = { params: Promise<{ token: string }> };

/** El veterinarian puede cargar/actualizar calendario de vacunas o desparasitación. */
export const POST = withApi(
  { rateLimit: "alerts" },
  async (request, context) => {
    const { token } = await (context.params as RouteContext["params"]);
    if (!token || !isUuid(token)) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 404 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const parsed = parsePreventiveBody(body, { requireKind: true });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const item = await insertPreventiveItemByVet(token, {
      kind: parsed.data.kind!,
      name: parsed.data.name,
      last_applied_at: parsed.data.last_applied_at,
      next_due_at: parsed.data.next_due_at,
      notes: parsed.data.notes,
    });

    if (!item) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ item }, { status: 201 });
  },
);
