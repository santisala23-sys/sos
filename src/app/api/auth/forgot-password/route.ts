import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { issuePasswordReset } from "@/lib/auth/issue-password-reset";
import { PASSWORD_RESET_COOLDOWN_MS } from "@/lib/auth/password-reset";
import { getPasswordResetRecordByEmail } from "@/lib/db/queries";

const GENERIC_OK = {
  ok: true,
  message:
    "Si existe una cuenta con ese email, te enviamos un enlace para restablecer la contraseña.",
};

export const POST = withApi(
  { rateLimit: "auth", rateLimitSuffix: "forgot-password" },
  async (request) => {
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Ingresá un email válido" },
        { status: 400 },
      );
    }

    const record = await getPasswordResetRecordByEmail(email);
    if (
      !record ||
      record.deleted_at ||
      record.deletion_requested_at ||
      !record.password_hash
    ) {
      return NextResponse.json(GENERIC_OK);
    }

    if (record.password_reset_sent_at) {
      const elapsed =
        Date.now() - new Date(record.password_reset_sent_at).getTime();
      if (elapsed < PASSWORD_RESET_COOLDOWN_MS) {
        return NextResponse.json(GENERIC_OK);
      }
    }

    await issuePasswordReset({
      userId: record.id,
      email: record.email,
      name: record.full_name,
    });

    return NextResponse.json(GENERIC_OK);
  },
);
