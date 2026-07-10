import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/with-api";
import {
  createSessionToken,
  getSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import {
  getEmailVerification,
  incrementEmailVerificationAttempts,
  markEmailVerified,
} from "@/lib/db/queries";
import {
  VERIFICATION_MAX_ATTEMPTS,
  verifyCodeMatches,
} from "@/lib/auth/verification";
import { logSecurityAudit } from "@/lib/security/audit";

export const POST = withApi(
  { rateLimit: "auth", rateLimitSuffix: "verify" },
  async (request, _ctx, meta) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const code = String((body as { code?: string }).code ?? "").trim();

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Ingresá el código de 6 dígitos" },
        { status: 400 },
      );
    }

    const record = await getEmailVerification(session.userId);
    if (!record) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (record.email_verified_at) {
      return finishVerified(session);
    }

    if (
      !record.email_verification_code_hash ||
      !record.email_verification_expires_at
    ) {
      return NextResponse.json(
        { error: "No hay un código activo. Pedí uno nuevo.", needsResend: true },
        { status: 400 },
      );
    }

    if (new Date(record.email_verification_expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "El código venció. Pedí uno nuevo.", needsResend: true },
        { status: 400 },
      );
    }

    if (record.email_verification_attempts >= VERIFICATION_MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: "Demasiados intentos. Pedí un código nuevo.",
          needsResend: true,
        },
        { status: 429 },
      );
    }

    if (!verifyCodeMatches(code, record.email_verification_code_hash)) {
      await incrementEmailVerificationAttempts(session.userId);
      return NextResponse.json(
        { error: "Código incorrecto" },
        { status: 400 },
      );
    }

    await markEmailVerified(session.userId);
    await logSecurityAudit({
      eventType: "email_verified",
      ipHash: meta.ipHash,
      userId: session.userId,
    });

    return finishVerified(session);
  },
);

async function finishVerified(session: {
  userId: string;
  email: string;
}): Promise<NextResponse> {
  const token = await createSessionToken({
    userId: session.userId,
    email: session.email,
    emailVerified: true,
  });
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions(token));
  return NextResponse.json({ ok: true });
}
