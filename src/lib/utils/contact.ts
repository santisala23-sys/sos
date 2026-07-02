const DEFAULT_WHATSAPP = "5491112345678";

export function getContactWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/\D/g, "") ??
    DEFAULT_WHATSAPP;
  return raw || DEFAULT_WHATSAPP;
}

export function buildWhatsAppUrl(message: string): string {
  const phone = getContactWhatsAppNumber();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildRequestMoreProfilesMessage(params: {
  email?: string;
  profileCount?: number;
}): string {
  const lines = [
    "Hola SOSme, quiero solicitar más perfiles QR.",
    params.email ? `Mi cuenta: ${params.email}` : null,
    params.profileCount != null
      ? `Perfiles actuales: ${params.profileCount}`
      : null,
    "Gracias.",
  ].filter(Boolean);

  return lines.join("\n");
}

export function buildPartnerInquiryMessage(params: {
  brandName?: string;
  productType?: string;
}): string {
  const lines = [
    "Hola SOSme, me interesa QR en productos físicos / marca.",
    params.brandName ? `Marca o proyecto: ${params.brandName}` : null,
    params.productType ? `Tipo de producto: ${params.productType}` : null,
    "Quiero más info. Gracias.",
  ].filter(Boolean);

  return lines.join("\n");
}
