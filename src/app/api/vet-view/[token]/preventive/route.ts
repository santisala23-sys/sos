import { NextResponse } from "next/server";
import {
  insertPreventiveItemByVet,
  updatePreventiveItemByVet,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { parsePreventiveBody } from "@/lib/pet-visit-validate";
import { withApi } from "@/lib/api/with-api";

type RouteContext = { params: Promise<{ token: string }> };

/** El veterinario puede cargar o actualizar el calendario de vacunas / desparasitación. */
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

    const updatingExisting = Boolean(
      body &&
        typeof body === "object" &&
        typeof (body as { id?: unknown }).id === "string" &&
        (body as { id: string }).id.trim(),
    );

    const parsed = parsePreventiveBody(body, {
      // Al actualizar una fila existente el tipo ya está en DB.
      requireKind: !updatingExisting,
    });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    if (parsed.data.id) {
      const item = await updatePreventiveItemByVet(token, parsed.data.id, {
        name: parsed.data.name,
        last_applied_at: parsed.data.last_applied_at,
        next_due_at: parsed.data.next_due_at,
      });

      if (!item) {
        return NextResponse.json(
          { error: "No se pudo actualizar ese ítem del calendario" },
          { status: 404 },
        );
      }

      return NextResponse.json({ item });
    }

    if (!parsed.data.kind) {
      return NextResponse.json(
        { error: "Tipo inválido (vacuna o desparasitación)" },
        { status: 400 },
      );
    }

    const item = await insertPreventiveItemByVet(token, {
      kind: parsed.data.kind,
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
