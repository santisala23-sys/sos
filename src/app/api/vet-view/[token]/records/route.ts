import { NextResponse } from "next/server";
import { insertVisitByVet } from "@/lib/db/queries-pet-medical";
import { notifyTutorPetVisit } from "@/lib/alerts/notify-tutor-pet-visit";
import { isUuid } from "@/lib/pet-medical";
import { parseVisitBody } from "@/lib/pet-visit-validate";
import { withApi } from "@/lib/api/with-api";

type RouteContext = { params: Promise<{ token: string }> };

/** Veterinario registra una visita (con notificación al tutor). */
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

    const parsed = parseVisitBody(body, { requireVetIdentity: true });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await insertVisitByVet(token, {
      visit_date: parsed.data.visit_date,
      summary: parsed.data.summary,
      indications: parsed.data.indications,
      tags: parsed.data.tags,
      vet_name: parsed.data.vet_name!,
      vet_license: parsed.data.vet_license!,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 404 },
      );
    }

    try {
      await notifyTutorPetVisit({
        tutorId: result.tutor_id,
        petId: result.visit.pet_id,
        petName: result.pet_name,
        vetName: result.visit.vet_name,
        hasIndications: Boolean(result.visit.indications?.trim()),
      });
    } catch (error) {
      console.error("[vet-view visit notify]", error);
    }

    return NextResponse.json({ visit: result.visit }, { status: 201 });
  },
);
