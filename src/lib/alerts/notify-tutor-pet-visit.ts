import { listPushSubscriptionsByUser } from "@/lib/db/queries";
import { sendWebPush } from "@/lib/push/send-web-push";
import { getAppUrl } from "@/lib/utils/app-url";

export type NotifyTutorPetVisitParams = {
  tutorId: string;
  petId: string;
  petName: string;
  vetName: string | null;
  hasIndications: boolean;
};

export async function notifyTutorPetVisit(
  params: NotifyTutorPetVisitParams,
): Promise<void> {
  const profileUrl = `${getAppUrl()}/dashboard/perfiles/${params.petId}`;
  const vetLabel = params.vetName?.trim() || "Un veterinario";
  const indicationsHint = params.hasIndications
    ? " Dejó indicaciones para el hogar."
    : "";
  const message = `${vetLabel} registró una visita veterinaria para ${params.petName}.${indicationsHint}\nVer libreta: ${profileUrl}`;

  if (process.env.NODE_ENV === "development") {
    console.log("[PET VISIT ALERT]", {
      timestamp: new Date().toISOString(),
      petId: params.petId,
      tutorId: params.tutorId,
    });
  }

  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vet_visit",
          beneficiaryName: params.petName,
          petId: params.petId,
          vetName: params.vetName,
          hasIndications: params.hasIndications,
          message,
          dashboardUrl: profileUrl,
        }),
      });
    } catch (error) {
      console.error("[PET VISIT ALERT] Webhook error:", error);
    }
  }

  const title = `🐾 Visita veterinaria — ${params.petName}`;
  const body = params.hasIndications
    ? `${vetLabel} cargó una visita con indicaciones. Tocá para ver.`
    : `${vetLabel} cargó una visita. Tocá para ver la libreta.`;

  const subscriptions = await listPushSubscriptionsByUser(params.tutorId);
  await Promise.all(
    subscriptions.map((sub) =>
      sendWebPush(sub, { title, body, url: profileUrl }),
    ),
  );
}
