import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { hashPassword } from "@/lib/auth/password";
import {
  hashPasswordResetToken,
  verifyPasswordResetToken,
} from "@/lib/auth/password-reset";
import {
  findUserByPasswordResetTokenHash,
  updateUserPassword,
} from "@/lib/db/queries";
import { validatePassword } from "@/lib/security/password-policy";

export const POST = withApi(
  { rateLimit: "auth", rateLimitSuffix: "reset-password" },
  async (request) => {
    let body: { token?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const token = body.token?.trim();
    const password = body.password;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const tokenHash = hashPasswordResetToken(token);
    const record = await findUserByPasswordResetTokenHash(tokenHash);

    if (
      !record ||
      !record.password_reset_token_hash ||
      !record.password_reset_expires_at
    ) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya fue usado." },
        { status: 400 },
      );
    }

    if (
      !verifyPasswordResetToken(token, record.password_reset_token_hash)
    ) {
      return NextResponse.json(
        { error: "El enlace no es válido o ya fue usado." },
        { status: 400 },
      );
    }

    if (new Date(record.password_reset_expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "El enlace expiró. Pedí uno nuevo desde iniciar sesión." },
        { status: 400 },
      );
    }

    if (record.deleted_at || record.deletion_requested_at) {
      return NextResponse.json(
        { error: "Esta cuenta no está disponible." },
        { status: 403 },
      );
    }

    const passwordHash = await hashPassword(password);
    await updateUserPassword(record.id, passwordHash);

    return NextResponse.json({
      ok: true,
      message: "Contraseña actualizada. Ya podés iniciar sesión.",
    });
  },
);
