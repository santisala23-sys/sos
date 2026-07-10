import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import { getEmailVerification } from "@/lib/db/queries";
import { issueVerificationCode } from "@/lib/auth/issue-verification";
import { VERIFICATION_RESEND_COOLDOWN_MS } from "@/lib/auth/verification";

export const POST = withApi(
  { rateLimit: "auth", rateLimitSuffix: "resend" },
  async () => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const record = await getEmailVerification(session.userId);
    if (!record) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (record.email_verified_at) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    if (record.email_verification_sent_at) {
      const elapsed =
        Date.now() - new Date(record.email_verification_sent_at).getTime();
      if (elapsed < VERIFICATION_RESEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil(
          (VERIFICATION_RESEND_COOLDOWN_MS - elapsed) / 1000,
        );
        return NextResponse.json(
          {
            error: `Esperá ${retryAfter}s antes de pedir otro código.`,
            retryAfter,
          },
          { status: 429, headers: { "Retry-After": String(retryAfter) } },
        );
      }
    }

    const sent = await issueVerificationCode({
      userId: session.userId,
      email: record.email,
      name: record.full_name,
    });

    if (!sent) {
      return NextResponse.json(
        { error: "No pudimos enviar el email. Intentá más tarde." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  },
);
