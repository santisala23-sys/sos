import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/with-api";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/db/queries";
import { legalAcceptancePayload } from "@/lib/legal/terms-cookie";
import { logSecurityAudit } from "@/lib/security/audit";
import { validatePassword } from "@/lib/security/password-policy";

export const POST = withApi(
  { rateLimit: "auth" },
  async (request, _ctx, meta) => {
    const body = await request.json();
    const { email, password, fullName, acceptedTerms, declaredEligible } = body as {
      email?: string;
      password?: string;
      fullName?: string;
      acceptedTerms?: boolean;
      declaredEligible?: boolean;
    };

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 },
      );
    }

    if (!acceptedTerms) {
      return NextResponse.json(
        { error: "Tenés que aceptar los Términos y la Política de Privacidad para continuar" },
        { status: 400 },
      );
    }

    if (!declaredEligible) {
      return NextResponse.json(
        {
          error:
            "Tenés que confirmar que sos mayor de edad y que contás con legitimación para actuar como tutor responsable",
        },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      const hint = existing.google_id
        ? "Ya tenés cuenta con Google. Usá «Continuar con Google»."
        : "Ya existe una cuenta con ese email";
      return NextResponse.json({ error: hint }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, fullName, legalAcceptancePayload());
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    await logSecurityAudit({
      eventType: "register",
      ipHash: meta.ipHash,
      userId: user.id,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  },
);
