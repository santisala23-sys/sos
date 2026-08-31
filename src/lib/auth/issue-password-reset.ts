import {
  hashPasswordResetToken,
  generatePasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth/password-reset";
import { setPasswordResetToken } from "@/lib/db/queries";
import { sendEmail } from "@/lib/email/send-email";
import { passwordResetEmail } from "@/lib/email/password-reset-email";
import { getAppUrl } from "@/lib/utils/app-url";

export async function issuePasswordReset(params: {
  userId: string;
  email: string;
  name?: string | null;
}): Promise<boolean> {
  const token = generatePasswordResetToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await setPasswordResetToken(
    params.userId,
    hashPasswordResetToken(token),
    expiresAt,
  );

  const resetUrl = `${getAppUrl()}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
  const { subject, html, text } = passwordResetEmail({
    resetUrl,
    name: params.name,
    ttlMinutes: Math.round(PASSWORD_RESET_TTL_MS / 60000),
  });

  const result = await sendEmail({
    to: params.email,
    subject,
    html,
    text,
  });

  return result.ok;
}
