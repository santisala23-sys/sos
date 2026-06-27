const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export function getDashboardLogUrl(scanLogId: string): string {
  return `${baseUrl}/dashboard/logs/${scanLogId}`;
}

export function getGoogleMapsUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function getGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number,
): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
}

export type AlertPayload = {
  type: "scan" | "sos" | "location" | "note";
  beneficiaryName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  scannedAt: string;
  latitude?: number | null;
  longitude?: number | null;
  scanLogId?: string;
  scannerNote?: string | null;
  message: string;
  dashboardUrl?: string;
  mapsUrl?: string | null;
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

export function buildAlertMessage(params: {
  type: AlertPayload["type"];
  beneficiaryName: string;
  scanLogId: string;
  latitude?: number | null;
  longitude?: number | null;
  scannerNote?: string | null;
}): { message: string; dashboardUrl: string; mapsUrl: string | null } {
  const dashboardUrl = getDashboardLogUrl(params.scanLogId);
  const mapsUrl =
    params.latitude != null && params.longitude != null
      ? getGoogleMapsUrl(Number(params.latitude), Number(params.longitude))
      : null;

  const locationLine = mapsUrl
    ? `Ubicación: ${mapsUrl}`
    : "Ubicación: no compartida aún.";

  const noteLine = params.scannerNote?.trim()
    ? `Nota: "${params.scannerNote.trim()}"`
    : null;

  const detailLine = `Ver detalle completo: ${dashboardUrl}`;

  let headline = "";
  switch (params.type) {
    case "scan":
      headline = `El perfil de ${params.beneficiaryName} acaba de ser escaneado.`;
      break;
    case "sos":
      headline = `¡ALERTA SOS! ${params.beneficiaryName} necesita ayuda urgente.`;
      break;
    case "location":
      headline = `Actualización de ubicación para ${params.beneficiaryName}.`;
      break;
    case "note":
      headline = `Nueva nota sobre ${params.beneficiaryName} tras un escaneo.`;
      break;
  }

  const parts = [headline, locationLine, noteLine, detailLine].filter(Boolean);
  return { message: parts.join("\n"), dashboardUrl, mapsUrl };
}
