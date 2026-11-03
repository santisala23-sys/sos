/** Precio de tienda: entrada en pesos ARS, almacenamiento en centavos. */

export function clampStoreDiscountPercent(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Convierte "24.000", "24000" o "24.000,50" → centavos. */
export function pesosInputToCents(input: string): number | null {
  const trimmed = input.trim().replace(/\$/g, "").replace(/\s/g, "");
  if (!trimmed) return null;

  const [intRaw, decRaw = ""] = trimmed.split(",");
  const intPart = intRaw.replace(/\./g, "");
  if (!/^\d+$/.test(intPart) || (decRaw && !/^\d{1,2}$/.test(decRaw))) {
    return null;
  }

  const pesos = Number(intPart) + Number(decRaw.padEnd(2, "0").slice(0, 2)) / 100;
  if (!Number.isFinite(pesos) || pesos < 0) return null;
  return Math.round(pesos * 100);
}

/** Centavos → "24.000" para el formulario admin. */
export function centsToPesosInput(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return "";
  const pesos = cents / 100;
  return pesos.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatCentsAsPesos(cents: number): string {
  return `$${(cents / 100).toLocaleString("es-AR")}`;
}

export type StoreProductPricing = {
  hasNumericPrice: boolean;
  originalCents: number | null;
  saleCents: number | null;
  discountPercent: number;
  /** Precio a mostrar (oferta o lista). */
  displayLabel: string;
};

export function resolveStoreProductPricing(input: {
  price_cents: number | null | undefined;
  price_label: string;
  discount_percent?: number | null;
}): StoreProductPricing {
  const discountPercent = clampStoreDiscountPercent(input.discount_percent);
  const priceCents =
    input.price_cents != null && input.price_cents > 0 ? input.price_cents : null;

  if (priceCents != null) {
    const saleCents =
      discountPercent > 0
        ? Math.round((priceCents * (100 - discountPercent)) / 100)
        : priceCents;
    return {
      hasNumericPrice: true,
      originalCents: priceCents,
      saleCents,
      discountPercent,
      displayLabel: formatCentsAsPesos(saleCents),
    };
  }

  return {
    hasNumericPrice: false,
    originalCents: null,
    saleCents: null,
    discountPercent,
    displayLabel: input.price_label?.trim() || "Consultar",
  };
}

export function parseStoreProductPricePayload(body: {
  price_cents?: number | null;
  price_pesos?: string;
  price_label?: string;
  discount_percent?: number | null;
}): {
  price_cents?: number | null;
  price_label?: string;
  discount_percent?: number;
} {
  const result: {
    price_cents?: number | null;
    price_label?: string;
    discount_percent?: number;
  } = {};

  if (body.price_pesos !== undefined) {
    result.price_cents = body.price_pesos.trim()
      ? pesosInputToCents(body.price_pesos)
      : null;
    if (body.price_pesos.trim() && result.price_cents == null) {
      throw new Error("Precio inválido");
    }
  } else if (body.price_cents !== undefined) {
    result.price_cents = body.price_cents;
  }

  if (body.price_label !== undefined) {
    result.price_label = body.price_label;
  }

  if (body.discount_percent !== undefined) {
    result.discount_percent = clampStoreDiscountPercent(body.discount_percent);
  }

  return result;
}

/** Texto para WhatsApp / pedidos (precio final). */
export function formatStorePriceForOrder(input: {
  price_cents: number | null | undefined;
  price_label: string;
  discount_percent?: number | null;
}): string {
  const pricing = resolveStoreProductPricing(input);
  if (!pricing.hasNumericPrice) return pricing.displayLabel;
  if (pricing.discountPercent > 0 && pricing.originalCents != null) {
    return `${pricing.displayLabel} (antes ${formatCentsAsPesos(pricing.originalCents)}, -${pricing.discountPercent}%)`;
  }
  return pricing.displayLabel;
}
