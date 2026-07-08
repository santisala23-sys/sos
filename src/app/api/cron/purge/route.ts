import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { processDueDeletionRequests, runRetentionPurge } from "@/lib/db/queries-maintenance";

function assertCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

export const POST = withApi({ rateLimit: "admin", skipLogging: false }, async (request) => {
  if (!assertCronSecret(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const purged = await runRetentionPurge();
  const due = await processDueDeletionRequests(200);

  return NextResponse.json({
    ok: true,
    purged: {
      ...purged,
      ...due,
    },
  });
});

