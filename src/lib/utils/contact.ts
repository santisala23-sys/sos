const DEFAULT_WHATSAPP = "5491132939080";

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

export function buildContactInquiryMessage(params: {
  motivoLabel: string;
  nombre?: string;
  detalle?: string;
}): string {
  const lines = [
    "Hola SOSme, te escribo desde la web de contacto.",
    "",
    `Motivo: ${params.motivoLabel}`,
    params.nombre?.trim() ? `Nombre / cuenta: ${params.nombre.trim()}` : null,
    params.detalle?.trim() ? `Mensaje:\n${params.detalle.trim()}` : null,
    "",
    "Gracias.",
  ].filter(Boolean);

  return lines.join("\n");
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

export function buildStoreCartWhatsAppMessage(params: {
  items: { product_name: string; quantity: number; unit_price_label: string }[];
}): string {
  const itemLines = params.items.map(
    (i) => `• ${i.quantity}x ${i.product_name} (${i.unit_price_label})`,
  );
  const lines = [
    "Hola SOSme, quiero consultar por estos productos de la tienda:",
    "",
    ...itemLines,
    "",
    "¿Me pasás info de pago y envío? Gracias.",
  ];

  return lines.join("\n");
}

export function buildStoreOrderWhatsAppMessage(params: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress?: string | null;
  customerNotes?: string | null;
  items: { product_name: string; quantity: number; unit_price_label: string }[];
}): string {
  const itemLines = params.items.map(
    (i) => `• ${i.quantity}x ${i.product_name} (${i.unit_price_label})`,
  );
  const lines = [
    "Hola SOSme, acabo de hacer un pedido desde la tienda.",
    `Pedido #${params.orderId.slice(0, 8).toUpperCase()}`,
    "",
    "Productos:",
    ...itemLines,
    "",
    `Nombre: ${params.customerName}`,
    `Tel: ${params.customerPhone}`,
    `Email: ${params.customerEmail}`,
    params.shippingAddress ? `Envío: ${params.shippingAddress}` : null,
    params.customerNotes ? `Notas: ${params.customerNotes}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}
