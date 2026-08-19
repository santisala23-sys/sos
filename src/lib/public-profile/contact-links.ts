import {
  buildWhatsAppEmergencyMessage,
  buildWhatsAppUrl,
  type WhatsAppMessageContext,
} from "@/lib/utils/whatsapp";
import type {
  PublicContactLink,
  PublicContactLinksResponse,
} from "@/types/public-contact";

export type ContactLink = PublicContactLink;
export type ContactLinksResponse = PublicContactLinksResponse;

export function buildTelUrl(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function buildContactLink(
  name: string,
  phone: string,
  messageContext: WhatsAppMessageContext,
): ContactLink {
  const message = buildWhatsAppEmergencyMessage(messageContext);
  return {
    name,
    telUrl: buildTelUrl(phone),
    whatsappUrl: buildWhatsAppUrl(phone, message),
  };
}

export function buildContactLinksResponse(
  row: {
    beneficiary_name: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    secondary_contact_name: string | null;
    secondary_contact_phone: string | null;
  },
  context: Omit<WhatsAppMessageContext, "beneficiaryName">,
): ContactLinksResponse {
  const messageContext: WhatsAppMessageContext = {
    beneficiaryName: row.beneficiary_name,
    ...context,
  };

  const primary = buildContactLink(
    row.emergency_contact_name,
    row.emergency_contact_phone,
    messageContext,
  );

  const hasSecondary =
    row.secondary_contact_name?.trim() && row.secondary_contact_phone?.trim();

  const secondary = hasSecondary
    ? buildContactLink(
        row.secondary_contact_name!.trim(),
        row.secondary_contact_phone!.trim(),
        messageContext,
      )
    : null;

  return { primary, secondary };
}
