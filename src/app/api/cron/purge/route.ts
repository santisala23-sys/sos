import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import { assertCronSecret } from "@/lib/cron/auth";
import { notifyTutorPreventiveReminder } from "@/lib/alerts/notify-tutor-preventive-reminder";
import { listPreventiveRemindersDue } from "@/lib/db/queries-pet-medical";
import {
  processDueDeletionRequests,
  runRetentionPurge,
} from "@/lib/db/queries-maintenance";

/**
 * Cron diario (Vercel 11:00 UTC ≈ 08:00 Argentina).
 * Purga de retención + bajas vencidas + recordatorios de vacunas/desparasitaciones.
 */
export const POST = withApi(
  { rateLimit: "admin", skipLogging: false },
  async (request) => {
    if (!assertCronSecret(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const purged = await runRetentionPurge();
    const due = await processDueDeletionRequests(200);

    const reminderCandidates = await listPreventiveRemindersDue();
    let remindersSent = 0;
    let remindersSkipped = 0;
    let remindersFailed = 0;

    for (const candidate of reminderCandidates) {
      try {
        const result = await notifyTutorPreventiveReminder(candidate);
        if (result.skipped) remindersSkipped += 1;
        else if (result.sent > 0) remindersSent += 1;
        else remindersFailed += 1;
      } catch (error) {
        remindersFailed += 1;
        console.error("[cron/purge] preventive reminder error", {
          itemId: candidate.itemId,
          error,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      purged: {
        ...purged,
        ...due,
      },
      preventiveReminders: {
        candidates: reminderCandidates.length,
        notified: remindersSent,
        skippedNoPush: remindersSkipped,
        failed: remindersFailed,
      },
    });
  },
);

/** Vercel Cron invoca GET por defecto en algunos setups; reutilizamos la misma lógica. */
export const GET = POST;
