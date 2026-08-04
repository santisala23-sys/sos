import {
  buildAlertMessage,
  buildPushNotification,
  sendFamilyAlert,
  type AlertPayload,
} from "@/lib/alerts/send-alert";
import {
  deletePushSubscription,
  listPushSubscriptionsByUser,
} from "@/lib/db/queries";
import { sendWebPushToUser } from "@/lib/push/send-web-push";

export type NotifyTutorParams = {
  tutorId: string;
  type: AlertPayload["type"];
  beneficiaryName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  scannedAt: string;
  scanLogId: string;
  latitude?: number | null;
  longitude?: number | null;
  locationApproximate?: boolean;
  locationArea?: string | null;
  scannerNote?: string | null;
};

export async function notifyTutor(params: NotifyTutorParams): Promise<void> {
  const { message, dashboardUrl, mapsUrl } = buildAlertMessage({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    scanLogId: params.scanLogId,
    latitude: params.latitude,
    longitude: params.longitude,
    locationApproximate: params.locationApproximate,
    locationArea: params.locationArea,
    scannerNote: params.scannerNote,
  });

  await sendFamilyAlert({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    emergencyContactName: params.emergencyContactName,
    emergencyContactPhone: params.emergencyContactPhone,
    scannedAt: params.scannedAt,
    latitude: params.latitude,
    longitude: params.longitude,
    scanLogId: params.scanLogId,
    scannerNote: params.scannerNote,
    message,
    dashboardUrl,
    mapsUrl,
  });

  const push = buildPushNotification({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    scannerNote: params.scannerNote,
    hasLocation: params.latitude != null && params.longitude != null,
    locationApproximate: params.locationApproximate,
    locationArea: params.locationArea,
  });

  const subscriptions = await listPushSubscriptionsByUser(params.tutorId);
  if (subscriptions.length === 0) {
    console.warn("[notify-tutor] No push subscriptions for tutor", params.tutorId);
    return;
  }

  const pushResult = await sendWebPushToUser(
    subscriptions,
    {
      title: push.title,
      body: push.body,
      url: dashboardUrl,
    },
    (endpoint) => deletePushSubscription(params.tutorId, endpoint),
  );

  if (pushResult.sent === 0) {
    console.error("[notify-tutor] Push delivery failed", {
      tutorId: params.tutorId,
      scanLogId: params.scanLogId,
      ...pushResult,
    });
  }
}
