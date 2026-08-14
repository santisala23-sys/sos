import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { notifyTutorPreventiveReminder } from "@/lib/alerts/notify-tutor-preventive-reminder";
import { listPreventiveRemindersDue } from "@/lib/db/queries-pet-medical";

function assertCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

/** Cron diario: avisos push de vacunas/desparasitaciones (3 días antes y el día). */
export const POST = withApi(
  { rateLimit: "admin", skipLogging: false },
  async (request) => {
    if (!assertCronSecret(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const candidates = await listPreventiveRemindersDue();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const candidate of candidates) {
      try {
        const result = await notifyTutorPreventiveReminder(candidate);
        if (result.skipped) skipped += 1;
        else if (result.sent > 0) sent += 1;
        else failed += 1;
      } catch (error) {
        failed += 1;
        console.error("[preventive-reminders] Error", {
          itemId: candidate.itemId,
          error,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      candidates: candidates.length,
      notified: sent,
      skippedNoPush: skipped,
      failed,
    });
  },
);
