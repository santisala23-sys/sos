import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  anonymizeAccountNow,
  cancelDeletionRequest,
  listDeletionRequests,
  processDueDeletionRequests,
  runRetentionPurge,
} from "@/lib/db/queries-maintenance";

export const GET = withApi({ requireAdmin: true, rateLimit: "admin" }, async (request) => {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 200), 500);
  const deletions = await listDeletionRequests(limit);
  return NextResponse.json({ deletions });
});

export const POST = withApi({ requireAdmin: true, rateLimit: "admin" }, async (request) => {
  let body: { action?: string; userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (body.action === "purge_now") {
    const purged = await runRetentionPurge();
    const due = await processDueDeletionRequests(200);
    return NextResponse.json({ ok: true, purged: { ...purged, ...due } });
  }

  if (!body.userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 });
  }

  if (body.action === "cancel_deletion") {
    const ok = await cancelDeletionRequest(body.userId);
    return NextResponse.json({ ok });
  }

  if (body.action === "anonymize_now") {
    const ok = await anonymizeAccountNow(body.userId);
    return NextResponse.json({ ok });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
});

