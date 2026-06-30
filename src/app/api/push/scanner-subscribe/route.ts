import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  deleteScannerPushSubscription,
  saveScannerPushSubscription,
} from "@/lib/db/queries";
import {
  authorizeScannerFromToken,
  denyScanner,
} from "@/lib/security/scanner-auth";
import { getScanTokenFromRequest } from "@/lib/security/scan-token";

export const POST = withApi(
  { rateLimit: "api" },
  async (request, _ctx, meta) => {
    const scanToken = getScanTokenFromRequest(request);
    if (!scanToken) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const access = await authorizeScannerFromToken(scanToken, meta.ipHash);
    if (!access) {
      return denyScanner(meta.ipHash, "scanner_push_denied");
    }

    const body = await request.json();
    const { endpoint, keys } = body as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await saveScannerPushSubscription(access.scanLogId, {
      endpoint,
      keys: { p256dh: keys.p256dh, auth: keys.auth },
    });

    return NextResponse.json({ ok: true });
  },
);

export const DELETE = withApi(
  { rateLimit: "api" },
  async (request, _ctx, meta) => {
    const scanToken = getScanTokenFromRequest(request);
    if (!scanToken) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const access = await authorizeScannerFromToken(scanToken, meta.ipHash);
    if (!access) {
      return denyScanner(meta.ipHash, "scanner_push_delete_denied");
    }

    const body = await request.json();
    const { endpoint } = body as { endpoint?: string };

    if (!endpoint) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    await deleteScannerPushSubscription(access.scanLogId, endpoint);
    return NextResponse.json({ ok: true });
  },
);
