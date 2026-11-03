import type { StoreProductRow } from "@/lib/db/queries-store";

/** Catálogo mínimo si la DB no devuelve productos (local / demo). */
export const CHAPITA_QR_MASCOTAS_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000038",
  name: "Chapita QR SOSme",
  slug: "chapita-qr-mascotas",
  product_type: "collar",
  description:
    "Chapita circular resistente con mosquetón para collar. QR de alta legibilidad y diseño «Escaneame» con huella. Incluye activación de perfil SOSme para tu mascota.",
  price_cents: null,
  price_label: "Consultar",
  image_url: "/images/products/chapita-qr-mascotas-qr.jpg",
  sort_order: 1,
  is_active: true,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export function withStoreCatalogFallback(
  products: StoreProductRow[],
): StoreProductRow[] {
  if (products.length > 0) return products;
  return [CHAPITA_QR_MASCOTAS_FALLBACK];
}
