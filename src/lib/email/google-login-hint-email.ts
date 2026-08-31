type GoogleLoginHintEmailParams = {
  name?: string | null;
};

export function googleLoginHintEmail({
  name,
}: GoogleLoginHintEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = name?.trim() ? `Hola ${name.trim()},` : "Hola,";
  const subject = "Tu cuenta SOSme usa Google";

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><title>${subject}</title></head>
<body style="margin:0;padding:0;background-color:#f5f3ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f3ff;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(124,58,237,0.12);">
        <tr><td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
          <div style="font-size:26px;font-weight:800;color:#ffffff;">SOS<span style="color:#c4b5fd;">me</span></div>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#171717;font-size:16px;">${greeting}</p>
          <p style="margin:0;color:#525252;font-size:15px;line-height:1.6;">
            Recibimos un pedido para restablecer contraseña, pero esta cuenta se creó con <strong>Google</strong>.
            Para ingresar, usá el botón <strong>Iniciar sesión con Google</strong> en la pantalla de login.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `${greeting}\n\nTu cuenta SOSme usa Google. Iniciá sesión con el botón de Google en /login.`;

  return { subject, html, text };
}
