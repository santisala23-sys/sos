export type StoreProductType =
  | "collar"
  | "colgante"
  | "iman"
  | "credencial"
  | "sticker"
  | "otro";

export type StoreOrderStatus =
  | "pending"
  | "contacted"
  | "confirmed"
  | "shipped"
  | "cancelled";

export const STORE_PRODUCT_TYPES: {
  value: StoreProductType;
  label: string;
  icon: string;
}[] = [
  { value: "collar", label: "Collar / chapita", icon: "🐾" },
  { value: "colgante", label: "Colgante", icon: "🏷️" },
  { value: "iman", label: "Imán", icon: "🧲" },
  { value: "credencial", label: "Credencial plastificada", icon: "🪪" },
  { value: "sticker", label: "Sticker / etiqueta", icon: "📎" },
  { value: "otro", label: "Otro", icon: "📦" },
];

export const STORE_ORDER_STATUSES: {
  value: StoreOrderStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pendiente" },
  { value: "contacted", label: "Contactado" },
  { value: "confirmed", label: "Confirmado" },
  { value: "shipped", label: "Enviado" },
  { value: "cancelled", label: "Cancelado" },
];

export function isStoreProductType(value: string): value is StoreProductType {
  return STORE_PRODUCT_TYPES.some((t) => t.value === value);
}

export function isStoreOrderStatus(value: string): value is StoreOrderStatus {
  return STORE_ORDER_STATUSES.some((s) => s.value === value);
}

export function getStoreProductTypeLabel(type: StoreProductType | string): string {
  return STORE_PRODUCT_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getStoreOrderStatusLabel(status: StoreOrderStatus | string): string {
  return STORE_ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function formatStorePrice(
  priceCents: number | null | undefined,
  priceLabel: string,
): string {
  if (priceCents != null && priceCents > 0) {
    return `$${(priceCents / 100).toLocaleString("es-AR")}`;
  }
  return priceLabel || "Consultar";
}
