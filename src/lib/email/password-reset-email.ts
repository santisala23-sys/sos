type PasswordResetEmailParams = {
  resetUrl: string;
  name?: string | null;
  ttlMinutes: number;
};

export function passwordResetEmail({
  resetUrl,
  name,
  ttlMinutes,
}: PasswordResetEmailParams): { subject: string; html: string; text: string } {
  const greeting = name?.trim() ? `Hola ${name.trim()},` : "Hola,";
  const subject = "Restablecé tu contraseña de SOSme";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(124,58,237,0.12);">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 32px 28px;text-align:center;">
              <div style="display:inline-block;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                SOS<span style="color:#c4b5fd;">me</span>
              </div>
              <p style="margin:10px 0 0;color:#ede9fe;font-size:14px;">
                Recuperación de contraseña
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#171717;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">
                Recibimos un pedido para restablecer la contraseña de tu cuenta. Tocá el botón para elegir una nueva.
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:12px;">
                  Restablecer contraseña
                </a>
              </div>
              <p style="margin:0 0 8px;color:#737373;font-size:13px;line-height:1.6;text-align:center;">
                El enlace vence en ${ttlMinutes} minutos.
              </p>
              <p style="margin:16px 0 0;color:#a3a3a3;font-size:12px;line-height:1.6;word-break:break-all;">
                Si el botón no funciona, copiá este enlace en el navegador:<br />
                <a href="${resetUrl}" style="color:#7c3aed;">${resetUrl}</a>
              </p>
              <p style="margin:24px 0 0;color:#a3a3a3;font-size:12px;line-height:1.6;">
                Si no pediste restablecer tu contraseña, podés ignorar este mensaje.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #f0f0f0;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#a3a3a3;font-size:12px;line-height:1.5;">
                SOSme — Contacto de emergencia con un simple QR
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${greeting}\n\nRestablecé tu contraseña de SOSme:\n${resetUrl}\n\nEl enlace vence en ${ttlMinutes} minutos.\n\nSi no pediste esto, ignorá este mensaje.`;

  return { subject, html, text };
}
