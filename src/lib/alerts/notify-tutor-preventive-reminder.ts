import {
  listPushSubscriptionsByUser,
  deletePushSubscription,
} from "@/lib/db/queries";
import {
  markPreventiveReminderSent,
  type PreventiveReminderCandidate,
} from "@/lib/db/queries-pet-medical";
import { PREVENTIVE_KIND_LABELS } from "@/lib/pet-medical";
import { sendWebPushToUser } from "@/lib/push/send-web-push";
import { getAppUrl } from "@/lib/utils/app-url";

function daysLabel(daysUntilDue: number): string {
  if (daysUntilDue <= 0) return "hoy";
  if (daysUntilDue === 1) return "mañana";
  return `en ${daysUntilDue} días`;
}

export function buildPreventiveReminderCopy(
  candidate: PreventiveReminderCandidate,
): { title: string; body: string } {
  const kindLabel = PREVENTIVE_KIND_LABELS[candidate.kind].toLowerCase();
  const libretaUrlHint = "Tocá para ver la libreta.";
  const emoji = candidate.kind === "checkup" ? "📅" : "💉";

  if (candidate.reminderKind === "due") {
    const overdue = candidate.daysUntilDue < 0;
    return {
      title: overdue
        ? `⚠️ ${kindLabel} vencida — ${candidate.petName}`
        : `${emoji} ${kindLabel} vence hoy — ${candidate.petName}`,
      body: overdue
        ? `${candidate.name} de ${candidate.petName} ya venció. ${libretaUrlHint}`
        : `${candidate.name} de ${candidate.petName} vence hoy. ${libretaUrlHint}`,
    };
  }

  return {
    title: `${emoji} Próxima ${kindLabel} — ${candidate.petName}`,
    body: `${candidate.name} de ${candidate.petName} vence ${daysLabel(candidate.daysUntilDue)}. ${libretaUrlHint}`,
  };
}

export async function notifyTutorPreventiveReminder(
  candidate: PreventiveReminderCandidate,
): Promise<{ sent: number; skipped: boolean }> {
  const subscriptions = await listPushSubscriptionsByUser(candidate.tutorId);
  if (subscriptions.length === 0) {
    // Sin dispositivos: igual marcamos como enviado para no reintentar cada día.
    await markPreventiveReminderSent(
      candidate.itemId,
      candidate.reminderKind,
      candidate.nextDueAt,
    );
    return { sent: 0, skipped: true };
  }

  const { title, body } = buildPreventiveReminderCopy(candidate);
  const url = `${getAppUrl()}/dashboard/perfiles/${candidate.petId}/libreta`;

  const result = await sendWebPushToUser(
    subscriptions,
    { title, body, url },
    (endpoint) => deletePushSubscription(candidate.tutorId, endpoint),
  );

  // Marcamos como enviado si llegó al menos a un dispositivo,
  // o si todos estaban expirados (ya no hay a quién avisar).
  if (result.sent > 0 || result.expired >= subscriptions.length) {
    await markPreventiveReminderSent(
      candidate.itemId,
      candidate.reminderKind,
      candidate.nextDueAt,
    );
  }

  return { sent: result.sent, skipped: false };
}
