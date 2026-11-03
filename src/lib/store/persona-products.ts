import type { StoreProductRow } from "@/lib/db/queries-store";

const ts = new Date(0).toISOString();

const CREDENCIAL_QR_FALLBACK: StoreProductRow = {
  id: "00000000-0000-4000-a000-000000000041",
  name: "Credencial plastificada",
  slug: "credencial-plastificada",
  product_type: "credencial",
  description:
    "Tarjeta plastificada tamaño credencial con QR, datos de contacto e instrucciones. Para personas, alergias o datos médicos.",
  price_cents: null,
  price_label: "Consultar",
  discount_percent: 0,
  image_url: "/images/products/tarjeta-credencial-qr-tarjeta.jpg",
  gallery_urls: [],
  sort_order: 40,
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

/** Credencial y sticker de la tienda, en ese orden. */
export function pickPersonaStoreProducts(
  products: StoreProductRow[],
): StoreProductRow[] {
  const credencial =
    firstActive(
      products,
      (product) =>
        product.slug === "tarjeta-credencial-qr" ||
        product.slug === "credencial-plastificada",
    ) ??
    firstActive(products, (product) => product.product_type === "credencial") ??
    CREDENCIAL_QR_FALLBACK;

  const sticker =
    firstActive(products, (product) => product.slug === "sticker-qr") ??
    firstActive(products, (product) => product.product_type === "sticker") ??
    STICKER_QR_FALLBACK;

  return [credencial, sticker];
}
