/**
 * Imágenes del catálogo (tienda en home):
 *
 * 1. Archivos en `public/images/products/` (jpg/png).
 * 2. Mapeo por slug en `STORE_PRODUCT_IMAGES_BY_SLUG` (una foto) o
 *    `STORE_PRODUCT_GALLERY_BY_SLUG` (varias fotos en la card).
 * 3. Con base de datos: campo `image_url` del producto (admin tienda) o migraciones
 *    en `db/migrations/` (p. ej. 039_collar_qr_hueso_patita.sql).
 * 4. Sin DB / demo local: `src/lib/store/catalog-fallback.ts` (`image_url` por producto).
 *
 * Slugs actuales collares: `collar-qr-hueso`, `collar-qr-patita`.
 */
import type { StoreProductType } from "@/lib/store/product-types";
import { normalizeGalleryUrls } from "@/lib/store/gallery-urls";

export const STORE_PRODUCT_IMAGES_BY_SLUG: Record<string, string> = {
  "collar-qr-hueso": "/images/products/collar-qr-hueso.jpg",
  "collar-qr-patita": "/images/products/collar-qr-patita.jpg",
  "chapita-qr-mascotas": "/images/products/chapita-qr-mascotas-qr.jpg",
  "collar-qr": "/images/products/collar-qr.png",
  "colgante-qr": "/images/products/colgante-qr-lanyard.jpg",
  "iman-qr": "/images/products/iman-qr.png",
  "credencial-plastificada": "/images/products/colgante-qr-lanyard.jpg",
  "sticker-qr": "/images/products/sticker-qr.jpg",
};

/** Slug → multiple images (carousel). Takes precedence over image_url. */
export const STORE_PRODUCT_GALLERY_BY_SLUG: Record<string, readonly string[]> = {
  "collar-qr-hueso": ["/images/products/collar-qr-hueso.jpg"],
  "collar-qr-patita": ["/images/products/collar-qr-patita.jpg"],
  "collar-con-qr-patita-celeste": [
    "/images/products/collar-patita-celeste-frente.jpg",
    "/images/products/collar-patita-celeste-qr.jpg",
  ],
  "collar-con-qr-patita-rosa": [
    "/images/products/collar-patita-rosa-frente.jpg",
    "/images/products/collar-patita-rosa-qr.jpg",
  ],
  "chapita-qr-mascotas": [
    "/images/products/chapita-qr-mascotas-qr.jpg",
    "/images/products/chapita-qr-mascotas-front.jpg",
  ],
  "collar-qr": [
    "/images/landing/hero-golden-retriever.jpg",
    "/images/landing/hero-golden-retriever-2.jpg",
  ],
};

export const STORE_PRODUCT_IMAGES_BY_TYPE: Record<
  Exclude<StoreProductType, "otro">,
  string
> = {
  collar: "/images/products/collar-qr.png",
  colgante: "/images/products/colgante-qr-lanyard.jpg",
  iman: "/images/products/iman-qr.png",
  credencial: "/images/products/colgante-qr-lanyard.jpg",
  sticker: "/images/products/sticker-qr.jpg",
};

export function getStoreProductImage(product: {
  slug: string;
  product_type: string;
  image_url?: string | null;
}): string | null {
  const bySlug = STORE_PRODUCT_IMAGES_BY_SLUG[product.slug];
  if (bySlug) return bySlug;

  if (product.image_url?.trim()) {
    return product.image_url.trim();
  }

  const type = product.product_type as StoreProductType;
  if (type !== "otro" && STORE_PRODUCT_IMAGES_BY_TYPE[type]) {
    return STORE_PRODUCT_IMAGES_BY_TYPE[type];
  }

  return null;
}

export function getStoreProductImages(product: {
  slug: string;
  product_type: string;
  image_url?: string | null;
  gallery_urls?: unknown;
}): string[] {
  const fromDb = normalizeGalleryUrls(product.gallery_urls);
  if (fromDb.length > 0) return fromDb;

  const gallery = STORE_PRODUCT_GALLERY_BY_SLUG[product.slug];
  if (gallery?.length) {
    return [...gallery];
  }

  const single = getStoreProductImage(product);
  return single ? [single] : [];
}
