import { NextResponse } from "next/server";
import {
  deleteScannerPushSubscription,
  findScanLogBySlugAccess,
  saveScannerPushSubscription,
} from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scanLogId, slug, endpoint, keys } = body as {
      scanLogId?: string;
      slug?: string;
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    if (!scanLogId || !slug || !endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const access = await findScanLogBySlugAccess(scanLogId, slug);
    if (!access) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 403 });
    }

    await saveScannerPushSubscription(scanLogId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/scanner-subscribe POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { scanLogId, slug, endpoint } = body as {
      scanLogId?: string;
      slug?: string;
      endpoint?: string;
    };

    if (!scanLogId || !slug || !endpoint) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const access = await findScanLogBySlugAccess(scanLogId, slug);
    if (!access) {
      return NextResponse.json({ error: "Sesión no válida" }, { status: 403 });
    }

    await deleteScannerPushSubscription(scanLogId, endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[push/scanner-subscribe DELETE]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
