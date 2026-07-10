type VerificationEmailParams = {
  code: string;
  name?: string | null;
  ttlMinutes: number;
};

/** Email de verificación con identidad visual de SOSme. */
export function verificationEmail({
  code,
  name,
  ttlMinutes,
}: VerificationEmailParams): { subject: string; html: string; text: string } {
  const greeting = name?.trim() ? `Hola ${name.trim()},` : "Hola,";
  const subject = `Tu código de verificación SOSme: ${code}`;

  const spacedCode = code.split("").join(" ");

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
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 32px 28px;text-align:center;">
              <div style="display:inline-block;font-size:26px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                SOS<span style="color:#c4b5fd;">me</span>
              </div>
              <p style="margin:10px 0 0;color:#ede9fe;font-size:14px;">
                Verificá tu correo para activar tu cuenta
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#171717;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 24px;color:#525252;font-size:15px;line-height:1.6;">
                Usá este código para confirmar tu dirección de email y empezar a usar SOSme.
              </p>
              <div style="text-align:center;margin:0 0 24px;">
                <div style="display:inline-block;background-color:#f5f3ff;border:1px solid #ddd6fe;border-radius:16px;padding:18px 28px;">
                  <span style="font-size:34px;font-weight:800;letter-spacing:10px;color:#6d28d9;font-family:'Courier New',monospace;">${spacedCode}</span>
                </div>
              </div>
              <p style="margin:0 0 8px;color:#737373;font-size:13px;line-height:1.6;text-align:center;">
                El código vence en ${ttlMinutes} minutos.
              </p>
              <p style="margin:24px 0 0;color:#a3a3a3;font-size:12px;line-height:1.6;">
                Si no creaste una cuenta en SOSme, podés ignorar este mensaje.
              </p>
            </td>
          </tr>
          <!-- Footer -->
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

  const text = `${greeting}\n\nTu código de verificación SOSme es: ${code}\nVence en ${ttlMinutes} minutos.\n\nSi no creaste una cuenta en SOSme, ignorá este mensaje.`;

  return { subject, html, text };
}
