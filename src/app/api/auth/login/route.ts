import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/with-api";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/queries";
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

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

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
