import nodemailer, { type Transporter } from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

let cachedTransporter: Transporter | null = null;

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() ||
    (process.env.SMTP_USER
      ? `SOSme <${process.env.SMTP_USER}>`
      : "SOSme <no-reply@sosme.com.ar>")
  );
}

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!user || !pass) return null;

  if (cachedTransporter) return cachedTransporter;

  const port = Number(process.env.SMTP_PORT ?? 587);
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL; 587 = STARTTLS
    auth: { user, pass },
  });
  return cachedTransporter;
}

/**
 * Envía un email transaccional vía SMTP (por defecto Gmail).
 * Si no hay credenciales SMTP configuradas, en desarrollo loguea el contenido
 * y no falla, para poder probar el flujo sin proveedor de email.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<SendEmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] SMTP no configurado (SMTP_USER/SMTP_PASS). Email NO enviado a ${to}.\n` +
          `Asunto: ${subject}\n${text ?? "(ver HTML)"}`,
      );
      return { ok: true, skipped: true };
    }
    console.error("[email] SMTP no configurado en producción.");
    return { ok: false, error: "Email no configurado" };
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
      ...(text ? { text } : {}),
    });
    return { ok: true };
  } catch (error) {
    console.error("[email] Error al enviar por SMTP:", error);
    return { ok: false, error: "Error al enviar el email" };
  }
}
