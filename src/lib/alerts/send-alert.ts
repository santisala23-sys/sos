export type AlertPayload = {
  type: "scan" | "sos" | "location";
  beneficiaryName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  scannedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  scanLogId?: string;
  message: string;
};

export async function sendFamilyAlert(payload: AlertPayload): Promise<void> {
  console.log("[SOS ALERT]", {
    timestamp: new Date().toISOString(),
    ...payload,
  });

  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[SOS ALERT] Webhook error:", error);
  }
}

export function buildScanMessage(
  beneficiaryName: string,
  hasLocation: boolean,
): string {
  if (hasLocation) {
    return `El perfil de ${beneficiaryName} acaba de ser escaneado. Se recibieron coordenadas GPS.`;
  }
  return `El perfil de ${beneficiaryName} acaba de ser escaneado (sin coordenadas GPS).`;
}

export function buildSosMessage(beneficiaryName: string): string {
  return `¡ALERTA SOS! ${beneficiaryName} solicita ayuda urgente.`;
}

export function buildLocationUpdateMessage(beneficiaryName: string): string {
  return `Actualización de ubicación para el perfil de ${beneficiaryName}.`;
}
