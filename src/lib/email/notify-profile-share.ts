import { findUserAccountById } from "@/lib/db/queries";
import { profileShareEmail } from "@/lib/email/profile-share-email";
import { sendEmail } from "@/lib/email/send-email";
import type { ProfileSharePermissionsInput } from "@/lib/profile-access";
import type { ProfileType } from "@/types/database";
import { getAppUrl } from "@/lib/utils/app-url";

type NotifyProfileShareParams = {
  ownerUserId: string;
  recipientUserId: string;
  recipientEmail: string;
  profileName: string;
  profileType: ProfileType;
  permissions: ProfileSharePermissionsInput;
  expiresAt: string | null;
  isUpdate?: boolean;
};

export async function notifyProfileShare(
  params: NotifyProfileShareParams,
): Promise<boolean> {
  const [owner, recipient] = await Promise.all([
    findUserAccountById(params.ownerUserId),
    findUserAccountById(params.recipientUserId),
  ]);

  const dashboardUrl = `${getAppUrl()}/dashboard`;

  const { subject, html, text } = profileShareEmail({
    recipientName: recipient?.full_name,
    ownerName: owner?.full_name,
    ownerEmail: owner?.email ?? "tu contacto",
    profileName: params.profileName,
    profileType: params.profileType,
    permissions: params.permissions,
    expiresAt: params.expiresAt,
    dashboardUrl,
    isUpdate: params.isUpdate,
  });

  const result = await sendEmail({
    to: params.recipientEmail,
    subject,
    html,
    text,
  });

  if (!result.ok && !result.skipped) {
    console.error("[notify-profile-share] No se pudo enviar email a", params.recipientEmail);
  }

  return result.ok;
}
