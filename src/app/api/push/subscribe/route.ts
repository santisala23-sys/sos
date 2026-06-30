import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/lib/db/queries";
import { logSecurityAudit } from "@/lib/security/audit";

export const POST = withApi(
  { rateLimit: "api" },
  async (request, _ctx, meta) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    const result = await savePushSubscription(session.userId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
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

    return NextResponse.json({ ok: true });
  },
);

export const DELETE = withApi(
  { rateLimit: "api" },
  async (request) => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body as { endpoint?: string };
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint requerido" }, { status: 400 });
    }

    await deletePushSubscription(session.userId, endpoint);
    return NextResponse.json({ ok: true });
  },
);
