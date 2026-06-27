import { getDashboardLogUrl, getGoogleMapsUrl } from "@/lib/alerts/send-alert";

export function normalizePhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export type WhatsAppMessageContext = {
  beneficiaryName: string;
  alertType?: "scan" | "sos" | "location" | "note" | "general";
  latitude?: number | null;
  longitude?: number | null;
  scannerNote?: string | null;
  scanLogId?: string | null;
};

export function buildWhatsAppEmergencyMessage(
  ctx: WhatsAppMessageContext,
): string {
  const lines: string[] = [];

  switch (ctx.alertType) {
    case "sos":
      lines.push(`🆘 *ALERTA SOS* — ${ctx.beneficiaryName} necesita ayuda urgente.`);
      break;
    case "scan":
      lines.push(`📱 Perfil SOS de *${ctx.beneficiaryName}* fue escaneado.`);
      break;
    case "note":
      lines.push(`💬 Nueva nota sobre *${ctx.beneficiaryName}*.`);
      break;
    case "location":
      lines.push(`📍 Actualización de ubicación — *${ctx.beneficiaryName}*.`);
      break;
    default:
      lines.push(`🆘 Emergencia — perfil SOS de *${ctx.beneficiaryName}*.`);
  }

  if (ctx.latitude != null && ctx.longitude != null) {
    lines.push(`Ubicación: ${getGoogleMapsUrl(ctx.latitude, ctx.longitude)}`);
  }

  if (ctx.scannerNote?.trim()) {
    lines.push(`Nota: ${ctx.scannerNote.trim()}`);
  }

  if (ctx.scanLogId) {
    lines.push(`Ver más: ${getDashboardLogUrl(ctx.scanLogId)}`);
  }

  return lines.join("\n");
}
