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
  type: "scan" | "sos" | "location" | "note" | "message";
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
  if (process.env.NODE_ENV === "development") {
    console.log("[SOS ALERT]", {
      timestamp: new Date().toISOString(),
      type: payload.type,
      scanLogId: payload.scanLogId,
    });
  }

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
  locationApproximate?: boolean;
  locationArea?: string | null;
  scannerNote?: string | null;
}): { message: string; dashboardUrl: string; mapsUrl: string | null } {
  const dashboardUrl = getDashboardLogUrl(params.scanLogId);
  const mapsUrl =
    params.latitude != null && params.longitude != null
      ? getGoogleMapsUrl(Number(params.latitude), Number(params.longitude))
      : null;

  let locationLine = "Ubicación: no compartida aún.";
  if (mapsUrl && params.locationApproximate) {
    const area = params.locationArea?.trim() || "zona del escaneo";
    locationLine = `Ubicación aproximada (${area}): ${mapsUrl}`;
  } else if (mapsUrl) {
    locationLine = `Ubicación: ${mapsUrl}`;
  }

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
    case "message":
      headline = `Nuevo mensaje sobre ${params.beneficiaryName}.`;
      break;
  }

  const parts = [headline, locationLine, noteLine, detailLine].filter(Boolean);
  return { message: parts.join("\n"), dashboardUrl, mapsUrl };
}

export function buildPushNotification(params: {
  type: AlertPayload["type"];
  beneficiaryName: string;
  scannerNote?: string | null;
  hasLocation?: boolean;
  locationApproximate?: boolean;
  locationArea?: string | null;
}): { title: string; body: string } {
  const { type, beneficiaryName, scannerNote, hasLocation, locationApproximate, locationArea } =
    params;
  const note = scannerNote?.trim();

  switch (type) {
    case "sos":
      return {
        title: `🆘 SOS — ${beneficiaryName}`,
        body: "Necesita ayuda urgente. Tocá para ver el detalle.",
      };
    case "location":
      return {
        title: `📍 Ubicación — ${beneficiaryName}`,
        body: hasLocation
          ? "Compartieron dónde están. Tocá para ver en el mapa."
          : "Hay una actualización de ubicación.",
      };
    case "message":
    case "note":
      return {
        title: `💬 Mensaje — ${beneficiaryName}`,
        body: note
          ? note.length > 90
            ? `${note.slice(0, 87)}…`
            : note
          : "Hay un mensaje nuevo en el chat.",
      };
    case "scan":
    default:
      return {
        title: `📱 QR escaneado — ${beneficiaryName}`,
        body:
          hasLocation && locationApproximate
            ? `Escaneo detectado cerca de ${locationArea?.trim() || "la zona del dispositivo"}.`
            : hasLocation
              ? "Alguien abrió el perfil con ubicación. Tocá para ver la actividad."
              : "Alguien abrió el perfil. Tocá para ver la actividad.",
      };
  }
}
