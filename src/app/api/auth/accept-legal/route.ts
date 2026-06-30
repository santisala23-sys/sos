import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { recordTermsAcceptance } from "@/lib/db/queries";
import { legalAcceptancePayload } from "@/lib/legal/terms-cookie";
import { withApi } from "@/lib/api/with-api";

export const POST = withApi({ rateLimit: "auth" }, async (request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    acceptedTerms?: boolean;
  };

  if (!body.acceptedTerms) {
    return NextResponse.json(
      { error: "Tenés que aceptar los Términos y la Política de Privacidad" },
      { status: 400 },
    );
  }

  const payload = legalAcceptancePayload();
  await recordTermsAcceptance(
    session.userId,
    payload.termsVersion,
    payload.privacyVersion,
  );

  return NextResponse.json({ ok: true });
});
