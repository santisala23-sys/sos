import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";

/** El PDF clínico ya no forma parte del QR de emergencia. */
export const GET = withApi({ rateLimit: "api" }, async () => {
  return NextResponse.json(
    { error: "El PDF clínico ya no está disponible en el perfil de emergencia" },
    { status: 410 },
  );
});
