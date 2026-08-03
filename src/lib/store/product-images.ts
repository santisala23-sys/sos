import type { StoreProductType } from "@/lib/store/product-types";

export const STORE_PRODUCT_IMAGES_BY_SLUG: Record<string, string> = {
  "collar-qr": "/images/products/collar-qr.png",
  "colgante-qr": "/images/products/colgante-qr-lanyard.jpg",
  "iman-qr": "/images/products/iman-qr.png",
  "credencial-plastificada": "/images/products/credencial-plastificada.png",
  "sticker-qr": "/images/products/sticker-qr.jpg",
};

/** Slug → multiple images (carousel). Takes precedence over image_url. */
export const STORE_PRODUCT_GALLERY_BY_SLUG: Record<string, readonly string[]> = {
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
  credencial: "/images/products/credencial-plastificada.png",
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
}): string[] {
  const gallery = STORE_PRODUCT_GALLERY_BY_SLUG[product.slug];
  if (gallery?.length) {
    return [...gallery];
  }

  const single = getStoreProductImage(product);
  return single ? [single] : [];
}
