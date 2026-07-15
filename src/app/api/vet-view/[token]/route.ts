import { NextResponse } from "next/server";
import {
  getPetByValidVetToken,
  listPetVetVisits,
} from "@/lib/db/queries-pet-medical";
import { isUuid } from "@/lib/pet-medical";
import { withApi } from "@/lib/api/with-api";

type RouteContext = { params: Promise<{ token: string }> };

export const GET = withApi({ rateLimit: "api" }, async (_request, context) => {
  const { token } = await (context.params as RouteContext["params"]);

  if (!token || !isUuid(token)) {
    return NextResponse.json(
      { error: "Enlace inválido o expirado" },
      { status: 404 },
    );
  }

  const pet = await getPetByValidVetToken(token);
  if (!pet) {
    return NextResponse.json(
      { error: "Enlace inválido o expirado" },
      { status: 404 },
    );
  }

  const visits = await listPetVetVisits(pet.id);

  return NextResponse.json({
    pet: {
      id: pet.id,
      beneficiary_name: pet.beneficiary_name,
      slug: pet.slug,
      allergies: pet.allergies,
      medical_notes: pet.medical_notes,
      avatar_b64: pet.avatar_b64,
      avatar_mime: pet.avatar_mime,
    },
    visits,
  });
});
