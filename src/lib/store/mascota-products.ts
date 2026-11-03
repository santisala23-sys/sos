import type { StoreProductRow } from "@/lib/db/queries-store";

const ts = new Date(0).toISOString();

const COLLAR_SLUGS = [
  "collar-qr",
  "collar-con-qr-patita-celeste",
  "collar-con-qr-patita",
] as const;

const COLLAR_FALLBACKS: StoreProductRow[] = [
  {
    id: "00000000-0000-4000-a000-000000000051",
    name: "Collar con QR (Huesito)",
    slug: "collar-qr",
    product_type: "collar",
    description:
      "Chapita en forma de hueso con mosquetón. QR en el frente, «Escaneame» al dorso. Resistente al agua.",
    price_cents: 2_400_000,
    price_label: "Consultar",
    discount_percent: 50,
    image_url: "/images/products/collar-hueso-violeta-frente.jpg",
    gallery_urls: [
      "/images/products/collar-hueso-violeta-frente.jpg",
      "/images/products/collar-hueso-violeta-qr.jpg",
    ],
    sort_order: 10,
    is_active: true,
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "00000000-0000-4000-a000-000000000052",
    name: "Collar con QR (Patita) - Celeste",
    slug: "collar-con-qr-patita-celeste",
    product_type: "collar",
    description:
      "Chapita celeste con patita y mosquetón. Trae QR de un lado y «Escaneame» del otro. Resistente al agua.",
    price_cents: 3_000_000,
    price_label: "Consultar",
    discount_percent: 50,
    image_url: "/images/products/collar-patita-celeste-frente.jpg",
    gallery_urls: [
      "/images/products/collar-patita-celeste-frente.jpg",
      "/images/products/collar-patita-celeste-qr.jpg",
    ],
    sort_order: 11,
    is_active: true,
    created_at: ts,
    updated_at: ts,
  },
  {
    id: "00000000-0000-4000-a000-000000000053",
    name: "Collar con QR (Patita) - Rosa",
    slug: "collar-con-qr-patita",
    product_type: "collar",
    description:
      "Chapita rosa con patita y mosquetón. QR de un lado y «Escaneame» del otro. Resistente al agua.",
    price_cents: 3_000_000,
    price_label: "Consultar",
    discount_percent: 50,
    image_url: "/images/products/collar-patita-rosa-frente.jpg",
    gallery_urls: [
      "/images/products/collar-patita-rosa-frente.jpg",
      "/images/products/collar-patita-rosa-qr.jpg",
    ],
    sort_order: 12,
    is_active: true,
    created_at: ts,
    updated_at: ts,
  },
];

/** Collares con QR de la tienda, en el orden de la vidriera. */
export function pickMascotaStoreProducts(
  products: StoreProductRow[],
): StoreProductRow[] {
  const picked = COLLAR_SLUGS.map((slug) =>
    products.find((product) => product.is_active && product.slug === slug),
  ).filter((product): product is StoreProductRow => Boolean(product));

  return picked.length > 0 ? picked : COLLAR_FALLBACKS;
}
