import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { issuePasswordReset } from "@/lib/auth/issue-password-reset";
import { PASSWORD_RESET_COOLDOWN_MS } from "@/lib/auth/password-reset";
import { getPasswordResetRecordByEmail } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email/send-email";
import { googleLoginHintEmail } from "@/lib/email/google-login-hint-email";

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
    if (!record || record.deleted_at || record.deletion_requested_at) {
      return NextResponse.json(GENERIC_OK);
    }

    if (!record.password_hash) {
      if (record.google_id) {
        const { subject, html, text } = googleLoginHintEmail({
          name: record.full_name,
        });
        await sendEmail({ to: record.email, subject, html, text });
      }
      return NextResponse.json(GENERIC_OK);
    }

    if (record.password_reset_sent_at) {
      const elapsed =
        Date.now() - new Date(record.password_reset_sent_at).getTime();
      if (elapsed < PASSWORD_RESET_COOLDOWN_MS) {
        const retryAfter = Math.ceil(
          (PASSWORD_RESET_COOLDOWN_MS - elapsed) / 1000,
        );
        return NextResponse.json(
          {
            error: `Esperá ${retryAfter}s antes de pedir otro enlace.`,
            retryAfter,
          },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        );
      }
    }

    const sent = await issuePasswordReset({
      userId: record.id,
      email: record.email,
      name: record.full_name,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "No pudimos enviar el email. Intentá más tarde." },
        { status: 502 },
      );
    }

    return NextResponse.json(GENERIC_OK);
  },
);
