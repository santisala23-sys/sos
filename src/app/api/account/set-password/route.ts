import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { withApi } from "@/lib/api/with-api";
import {
  findUserAccountById,
  updateUserPassword,
} from "@/lib/db/queries";
import { validatePassword } from "@/lib/security/password-policy";
import { logSecurityAudit } from "@/lib/security/audit";

export const POST = withApi(
  { rateLimit: "auth", rateLimitSuffix: "set-password" },
  async (request, _ctx, meta) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    let body: { password?: string; confirmPassword?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const password = body.password ?? "";
    const confirmPassword = body.confirmPassword ?? "";

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: "Completá la contraseña y la confirmación" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const account = await findUserAccountById(session.userId);
    if (!account) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (account.has_password) {
      return NextResponse.json(
        {
          error:
            "Tu cuenta ya tiene contraseña. Usá «Recuperar contraseña» si querés cambiarla.",
          code: "PASSWORD_ALREADY_SET",
        },
        { status: 409 },
      );
    }

    if (!account.google_id) {
      return NextResponse.json(
        {
          error:
            "Esta cuenta no usa Google. Usá recuperar contraseña si olvidaste la tuya.",
        },
        { status: 400 },
      );
    }

    await updateUserPassword(session.userId, await hashPassword(password));

    await logSecurityAudit({
      eventType: "password_set",
      ipHash: meta.ipHash,
      userId: session.userId,
      details: { method: "google_account_link" },
    });

    return NextResponse.json({
      ok: true,
      message:
        "Contraseña creada. Podés seguir entrando con Google o con tu correo y contraseña.",
      authMethod: "google_and_email",
    });
  },
);
