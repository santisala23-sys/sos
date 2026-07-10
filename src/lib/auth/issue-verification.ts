import { setEmailVerificationCode } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email/send-email";
import { verificationEmail } from "@/lib/email/verification-email";
import {
  generateVerificationCode,
  hashVerificationCode,
  VERIFICATION_CODE_TTL_MS,
} from "@/lib/auth/verification";

/**
 * Genera un nuevo código de verificación, lo guarda hasheado y envía el email.
 * Devuelve `false` si el email no se pudo enviar (proveedor mal configurado).
 */
export async function issueVerificationCode(params: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<boolean> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  await setEmailVerificationCode(params.userId, hashVerificationCode(code), expiresAt);

  const { subject, html, text } = verificationEmail({
    code,
    name: params.name,
    ttlMinutes: Math.round(VERIFICATION_CODE_TTL_MS / 60000),
  });

  const result = await sendEmail({ to: params.email, subject, html, text });
  return result.ok;
}
