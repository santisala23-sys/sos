import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/with-api";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/queries";
import { issueVerificationCode } from "@/lib/auth/issue-verification";
import { logSecurityAudit } from "@/lib/security/audit";

export const POST = withApi(
  { rateLimit: "auth" },
  async (request, _ctx, meta) => {
    const body = await request.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      await logSecurityAudit({
        eventType: "login_failed",
        ipHash: meta.ipHash,
        details: { email: email.toLowerCase(), reason: "user_not_found" },
      });
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    if (user.deleted_at) {
      return NextResponse.json(
        { error: "Esta cuenta fue dada de baja" },
        { status: 403 },
      );
    }

    if (user.deletion_requested_at) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta tiene una baja solicitada. Si fue un error, contactanos desde /contacto.",
        },
        { status: 403 },
      );
    }

    const valid = user.password_hash
      ? await verifyPassword(password, user.password_hash)
      : false;

    if (!valid) {
      await logSecurityAudit({
        eventType: "login_failed",
        ipHash: meta.ipHash,
        userId: user.id,
        details: { reason: "bad_password" },
      });
      const hint = user.google_id
        ? "Esta cuenta usa Google. Iniciá sesión con el botón de Google."
        : "Credenciales incorrectas";
      return NextResponse.json({ error: hint }, { status: 401 });
    }

    const emailVerified = Boolean(user.email_verified_at);

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      emailVerified,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    // Cuenta sin verificar: reenviamos código y mandamos a /verificar.
    if (!emailVerified) {
      await issueVerificationCode({
        userId: user.id,
        email: user.email,
        name: user.full_name,
      });
      return NextResponse.json({
        needsVerification: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      });
    }

    await logSecurityAudit({
      eventType: "login_success",
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
