import type { StoreProductRow } from "@/lib/db/queries-store";

const ts = new Date(0).toISOString();

const CREDENCIAL_QR_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000041",
  name: "Tarjeta credencial QR",
  slug: "colgante-qr",
  product_type: "colgante",
  description:
    "Tarjeta con QR para usar con cinta al cuello. Al escanearla se ven contactos de emergencia y datos importantes de la persona.",
  price_cents: 1_600_000,
  price_label: "Consultar",
  discount_percent: 50,
  image_url: "/images/products/tarjeta-credencial-qr-tarjeta.jpg",
  gallery_urls: [
    "/images/products/tarjeta-credencial-qr-tarjeta.jpg",
    "/images/landing/use-case-personas-photo.png",
    "/images/products/tarjeta-credencial-qr-uso.jpg",
  ],
  sort_order: 20,
  is_active: true,
  created_at: ts,
  updated_at: ts,
};

const STICKER_QR_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000042",
  name: "Sticker QR",
  slug: "sticker-qr",
  product_type: "sticker",
  description: "Sticker vinílico resistente para cascos. QR de alta legibilidad.",
  price_cents: null,
  price_label: "Consultar",
  discount_percent: 0,
  image_url: "/images/products/sticker-qr-casco.jpg",
  gallery_urls: [],
  sort_order: 50,
  is_active: true,
  created_at: ts,
  updated_at: ts,
};

function firstActive(
  products: StoreProductRow[],
  match: (product: StoreProductRow) => boolean,
): StoreProductRow | undefined {
  return products.find((product) => product.is_active && match(product));
}

function isTarjetaCredencial(product: StoreProductRow): boolean {
  const name = product.name.trim().toLowerCase();
  return (
    product.slug === "colgante-qr" ||
    product.slug === "tarjeta-credencial-qr" ||
    (name.includes("tarjeta") && name.includes("credencial"))
  );
}

/** Credencial y sticker de la tienda, en ese orden. */
export function pickPersonaStoreProducts(
  products: StoreProductRow[],
): StoreProductRow[] {
  const credencial =
    firstActive(products, isTarjetaCredencial) ?? CREDENCIAL_QR_FALLBACK;

  const sticker =
    firstActive(products, (product) => product.slug === "sticker-qr") ??
    firstActive(products, (product) => product.product_type === "sticker") ??
    STICKER_QR_FALLBACK;

  return [credencial, sticker];
}
