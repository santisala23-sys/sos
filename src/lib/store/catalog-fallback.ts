import type { StoreProductRow } from "@/lib/db/queries-store";

const ts = new Date(0).toISOString();

export const COLLAR_QR_HUESO_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000039",
  name: "Collar QR Hueso",
  slug: "collar-qr-hueso",
  product_type: "collar",
  description:
    "Chapita circular celeste con mosquetón. QR en el frente e identificación «Escaneame» con diseño hueso. Resistente al agua.",
  price_cents: null,
  price_label: "Consultar",
  image_url: "/images/products/collar-qr-hueso.jpg",
  sort_order: 1,
  is_active: true,
  created_at: ts,
  updated_at: ts,
};

export const COLLAR_QR_PATITA_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000040",
  name: "Collar QR Patita",
  slug: "collar-qr-patita",
  product_type: "collar",
  description:
    "Chapita circular celeste con mosquetón. QR en el frente e identificación «Escaneame» con huella. Resistente al agua.",
  price_cents: null,
  price_label: "Consultar",
  image_url: "/images/products/collar-qr-patita.jpg",
  sort_order: 2,
  is_active: true,
  created_at: ts,
  updated_at: ts,
};

export const STORE_CATALOG_FALLBACK: StoreProductRow[] = [
  COLLAR_QR_HUESO_FALLBACK,
  COLLAR_QR_PATITA_FALLBACK,
];

const FEATURED_SLUGS = ["collar-qr-hueso", "collar-qr-patita"] as const;

export function withStoreCatalogFallback(
  products: StoreProductRow[],
): StoreProductRow[] {
  const featured = FEATURED_SLUGS.map((slug) =>
    products.find((p) => p.slug === slug && p.is_active),
  ).filter((p): p is StoreProductRow => Boolean(p));

  if (featured.length > 0) return featured;

  if (products.length > 0) {
    return [...products].sort((a, b) => a.sort_order - b.sort_order);
  }

  return STORE_CATALOG_FALLBACK;
}
