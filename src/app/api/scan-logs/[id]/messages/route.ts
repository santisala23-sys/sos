import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import { notifyTutor } from "@/lib/alerts/notify-tutor";
import { notifyScanner } from "@/lib/alerts/notify-scanner";
import {
  addScanMessage,
  findScanLogForTutor,
  getScanLogContextForNotify,
  listScanMessages,
} from "@/lib/db/queries";
import { getScanTokenFromRequest } from "@/lib/security/scan-token";
import {
  authorizeScannerAccess,
  authorizeScannerFromToken,
  denyScanner,
} from "@/lib/security/scanner-auth";

const MAX_MESSAGE_LENGTH = 2000;

type RouteContext = { params: Promise<{ id: string }> };

async function resolveAccess(
  request: Request,
  scanLogId: string,
  slug: string | null,
  ipHash: string | null,
): Promise<"public" | "tutor" | null> {
  const session = await getSession();
  if (session) {
    const log = await findScanLogForTutor(scanLogId, session.userId);
    if (log) return "tutor";
  }

  const token = getScanTokenFromRequest(request);
  if (token) {
    const scanner = await authorizeScannerFromToken(token, ipHash);
    if (scanner && scanner.scanLogId === scanLogId) return "public";
  }

  if (slug) {
    const scanner = await authorizeScannerAccess(request, scanLogId, slug);
    if (scanner) return "public";
    await denyScanner(ipHash, "messages_slug_fallback_denied");
  }

  return null;
}

export const GET = withApi(
  { rateLimit: "api", rateLimitSuffix: "messages-read" },
  async (request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    const access = await resolveAccess(request, id, slug, meta.ipHash);
    if (!access) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const messages = await listScanMessages(id);
    return NextResponse.json({ messages });
  },
);

export const POST = withApi(
  { rateLimit: "messages", rateLimitSuffix: "messages-send" },
  async (request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);

    const body = await request.json();
    const { message, slug } = body as { message?: string; slug?: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: "message es requerido" }, { status: 400 });
    }

    if (message.trim().length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Máximo ${MAX_MESSAGE_LENGTH} caracteres` },
        { status: 400 },
      );
    }

    const access = await resolveAccess(request, id, slug ?? null, meta.ipHash);
    if (!access) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    if (access === "public") {
      const created = await addScanMessage(id, "public", message);
      if (!created) {
        return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
      }

      try {
        const ctx = await getScanLogContextForNotify(id);
        if (ctx) {
          await notifyTutor({
            tutorId: ctx.tutor_id,
            type: "message",
            beneficiaryName: ctx.beneficiary_name,
            emergencyContactName: ctx.emergency_contact_name,
            emergencyContactPhone: ctx.emergency_contact_phone,
            scannedAt: ctx.scanned_at,
            scanLogId: id,
            latitude: ctx.latitude,
            longitude: ctx.longitude,
            scannerNote: message.trim(),
          });
        }
      } catch (notifyError) {
        console.error("[scan-messages POST] notify tutor:", notifyError);
      }

      return NextResponse.json({ message: created });
    }

    const log = await findScanLogForTutor(id, (await getSession())!.userId);
    if (!log) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const created = await addScanMessage(id, "tutor", message);
    if (!created) {
      return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
    }

    try {
      await notifyScanner({
        scanLogId: id,
        slug: log.slug,
        body: message.trim(),
      });
    } catch (notifyError) {
      console.error("[scan-messages POST] notify scanner:", notifyError);
    }

    return NextResponse.json({ message: created });
  },
);
