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

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function getFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || "SOSme <no-reply@sosme.com.ar>";
}

/**
 * Envía un email transaccional vía Resend (HTTP API, sin dependencias extra).
 * Si no hay `RESEND_API_KEY` configurada, en desarrollo loguea el contenido y
 * no falla, para poder probar el flujo sin proveedor de email.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] RESEND_API_KEY no configurada. Email NO enviado a ${to}.\n` +
          `Asunto: ${subject}\n${text ?? "(ver HTML)"}`,
      );
      return { ok: true, skipped: true };
    }
    console.error("[email] RESEND_API_KEY no configurada en producción.");
    return { ok: false, error: "Email no configurado" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [to],
        subject,
        html,
        ...(text ? { text } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend error:", res.status, detail);
      return { ok: false, error: `Resend ${res.status}` };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] Error de red al enviar:", error);
    return { ok: false, error: "Error de red" };
  }
}
