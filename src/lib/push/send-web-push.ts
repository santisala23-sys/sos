import webpush from "web-push";
import { getServerVapidPublicKey } from "@/lib/push/vapid";

function configureVapid() {
  const publicKey = getServerVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:somososme@gmail.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export type PushSendResult =
  | { ok: true }
  | { ok: false; expired: boolean; statusCode?: number; message?: string };

export async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<PushSendResult> {
  if (!configureVapid()) {
    console.error("[web-push] VAPID keys not configured");
    return { ok: false, expired: false, message: "vapid_not_configured" };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60,
        urgency: "high",
      },
    );
    return { ok: true };
  } catch (error) {
    const statusCode =
      error instanceof webpush.WebPushError ? error.statusCode : undefined;
    const expired = statusCode === 410 || statusCode === 404;
    const body =
      error instanceof webpush.WebPushError
        ? error.body?.slice(0, 200)
        : undefined;
    console.error("[web-push] Error:", {
      statusCode,
      endpoint: subscription.endpoint.slice(0, 80),
      body,
    });
    return {
      ok: false,
      expired,
      statusCode,
      message: error instanceof Error ? error.message : "unknown_error",
    };
  }
}

export type PushDeliverySummary = {
  sent: number;
  failed: number;
  expired: number;
  lastStatusCode?: number;
  vapidConfigured: boolean;
};

export async function sendWebPushToUser(
  subscriptions: { endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload,
  onExpired?: (endpoint: string) => Promise<void>,
): Promise<PushDeliverySummary> {
  let sent = 0;
  let failed = 0;
  let expired = 0;
  let lastStatusCode: number | undefined;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const result = await sendWebPush(subscription, payload);
      if (result.ok) {
        sent += 1;
        return;
      }

      if (result.statusCode) {
        lastStatusCode = result.statusCode;
      }

      if (result.expired) {
        expired += 1;
        await onExpired?.(subscription.endpoint);
        return;
      }

      failed += 1;
    }),
  );

  return {
    sent,
    failed,
    expired,
    lastStatusCode,
    vapidConfigured: configureVapid(),
  };
}
