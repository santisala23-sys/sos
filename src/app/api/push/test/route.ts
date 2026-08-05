import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import {
  deletePushSubscription,
  listPushSubscriptionsByUser,
} from "@/lib/db/queries";
import { sendWebPushToUser } from "@/lib/push/send-web-push";

export const POST = withApi({ rateLimit: "api" }, async (request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    endpoint?: string;
  };

  let subscriptions = await listPushSubscriptionsByUser(session.userId);
  if (body.endpoint?.trim()) {
    subscriptions = subscriptions.filter(
      (subscription) => subscription.endpoint === body.endpoint,
    );
  }

  if (subscriptions.length === 0) {
    return NextResponse.json(
      {
        error:
          "No encontramos alertas activas para este dispositivo. Volvé a activarlas.",
      },
      { status: 404 },
    );
  }

  const result = await sendWebPushToUser(
    subscriptions,
    {
      title: "SOSme — Alertas activas",
      body: "Listo. Vas a recibir avisos cuando escaneen tu QR o haya SOS.",
      url: "/dashboard/actividad",
    },
    (endpoint) => deletePushSubscription(session.userId, endpoint),
  );

  return NextResponse.json({
    ok: result.sent > 0,
    ...result,
  });
});
