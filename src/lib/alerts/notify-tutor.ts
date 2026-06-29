import {
  buildAlertMessage,
  buildPushNotification,
  sendFamilyAlert,
  type AlertPayload,
} from "@/lib/alerts/send-alert";
import { listPushSubscriptionsByUser } from "@/lib/db/queries";
import { sendWebPush } from "@/lib/push/send-web-push";

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
  scannerNote?: string | null;
};

export async function notifyTutor(params: NotifyTutorParams): Promise<void> {
  const { message, dashboardUrl, mapsUrl } = buildAlertMessage({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    scanLogId: params.scanLogId,
    latitude: params.latitude,
    longitude: params.longitude,
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
  });

  const subscriptions = await listPushSubscriptionsByUser(params.tutorId);
  await Promise.all(
    subscriptions.map((sub) =>
      sendWebPush(sub, {
        title: push.title,
        body: push.body,
        url: dashboardUrl,
      }),
    ),
  );
}
