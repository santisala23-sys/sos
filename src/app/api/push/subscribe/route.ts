import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import {
  deletePushSubscription,
  deletePushSubscriptionById,
  listPushSubscriptionDevices,
  savePushSubscription,
} from "@/lib/db/queries";
import { toPushDeviceSummary } from "@/lib/push/device-label";
import { sendWebPush } from "@/lib/push/send-web-push";
import { logSecurityAudit } from "@/lib/security/audit";

export const GET = withApi({ rateLimit: "api" }, async (request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const currentEndpoint =
    new URL(request.url).searchParams.get("currentEndpoint")?.trim() || null;
  const rows = await listPushSubscriptionDevices(session.userId);

  return NextResponse.json({
    devices: rows.map((row) => toPushDeviceSummary(row, currentEndpoint)),
  });
});

export const POST = withApi(
  { rateLimit: "api" },
  async (request, _ctx, meta) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys, userAgent } = body as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
      userAgent?: string;
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    const result = await savePushSubscription(session.userId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
      userAgent: userAgent ?? null,
    });

    if (result === "conflict") {
      await logSecurityAudit({
        eventType: "push_hijack_blocked",
        ipHash: meta.ipHash,
        userId: session.userId,
        details: { endpoint: endpoint.slice(0, 60) },
      });
      return NextResponse.json(
        { error: "Este dispositivo ya está registrado en otra cuenta" },
        { status: 409 },
      );
    }

    const testResult = await sendWebPush(
      {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      {
        title: "SOSme — Alertas activas",
        body: "Listo. Vas a recibir avisos cuando escaneen tu QR o haya SOS.",
        url: "/dashboard/actividad",
      },
    );

    return NextResponse.json({
      ok: true,
      testDelivered: testResult.ok,
      testStatusCode: testResult.ok ? undefined : testResult.statusCode,
      testExpired: testResult.ok ? false : testResult.expired,
    });
  },
);

export const DELETE = withApi({ rateLimit: "api" }, async (request) => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, id } = body as { endpoint?: string; id?: string };

  if (id) {
    const removed = await deletePushSubscriptionById(session.userId, id);
    if (!removed) {
      return NextResponse.json({ error: "Dispositivo no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!endpoint) {
    return NextResponse.json(
      { error: "endpoint o id requerido" },
      { status: 400 },
    );
  }

  await deletePushSubscription(session.userId, endpoint);
  return NextResponse.json({ ok: true });
});
