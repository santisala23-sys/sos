import {
  buildAlertMessage,
  buildPushNotification,
  type AlertPayload,
} from "@/lib/alerts/send-alert";
import {
  deletePushSubscription,
  listPushSubscriptionsByUser,
} from "@/lib/db/queries";
import { listAlertRecipientUserIds } from "@/lib/db/queries-profile-shares";
import { sendWebPushToUser } from "@/lib/push/send-web-push";

export type NotifyTutorParams = {
  profileId: string;
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
  const { message: _message, dashboardUrl, mapsUrl: _mapsUrl } = buildAlertMessage({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    scanLogId: params.scanLogId,
    latitude: params.latitude,
    longitude: params.longitude,
    locationApproximate: params.locationApproximate,
    locationArea: params.locationArea,
    scannerNote: params.scannerNote,
  });

  const push = buildPushNotification({
    type: params.type,
    beneficiaryName: params.beneficiaryName,
    scannerNote: params.scannerNote,
    hasLocation: params.latitude != null && params.longitude != null,
    locationApproximate: params.locationApproximate,
    locationArea: params.locationArea,
  });

  let recipientIds: string[] = [];
  try {
    recipientIds = await listAlertRecipientUserIds(params.profileId);
  } catch (error) {
    console.error("[notify-tutor] Failed to list alert recipients", error);
    return;
  }

  const uniqueRecipients = [...new Set(recipientIds)];

  await Promise.all(
    uniqueRecipients.map(async (userId) => {
      try {
        const subscriptions = await listPushSubscriptionsByUser(userId);
        if (subscriptions.length === 0) {
          console.warn("[notify-tutor] No push subscriptions for user", userId);
          return;
        }

        const pushResult = await sendWebPushToUser(
          subscriptions,
          {
            title: push.title,
            body: push.body,
            url: dashboardUrl,
          },
          (endpoint) => deletePushSubscription(userId, endpoint),
        );

        if (pushResult.sent === 0) {
          console.error("[notify-tutor] Push delivery failed", {
            userId,
            scanLogId: params.scanLogId,
            ...pushResult,
          });
        }
      } catch (error) {
        console.error("[notify-tutor] Push error for user", userId, error);
      }
    }),
  );
}
