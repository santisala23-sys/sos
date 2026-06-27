import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  deletePushSubscription,
  savePushSubscription,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
    }

    await savePushSubscription(session.userId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/subscribe]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
}
