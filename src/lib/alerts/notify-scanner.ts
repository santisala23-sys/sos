import { listScannerPushSubscriptions } from "@/lib/db/queries";
import { getPublicProfileUrl } from "@/lib/utils/slug";
import { sendWebPush } from "@/lib/push/send-web-push";

export async function notifyScanner(params: {
  scanLogId: string;
  slug: string;
  body: string;
}): Promise<void> {
  const subscriptions = await listScannerPushSubscriptions(params.scanLogId);
  if (subscriptions.length === 0) return;

  const url = getPublicProfileUrl(params.slug);
  const preview =
    params.body.length > 120 ? `${params.body.slice(0, 117)}...` : params.body;

  await Promise.all(
    subscriptions.map((sub) =>
      sendWebPush(sub, {
        title: "Respuesta de la familia",
        body: preview,
        url,
      }),
    ),
  );
}
