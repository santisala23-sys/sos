import type { StoreProductType } from "@/lib/store/product-types";

export const STORE_PRODUCT_IMAGES_BY_SLUG: Record<string, string> = {
  "collar-qr": "/images/products/collar-qr.png",
  "colgante-qr": "/images/products/colgante-qr.png",
  "iman-qr": "/images/products/iman-qr.png",
  "credencial-plastificada": "/images/products/credencial-plastificada.png",
  "sticker-qr": "/images/products/sticker-qr.jpg",
};

export const STORE_PRODUCT_IMAGES_BY_TYPE: Record<
  Exclude<StoreProductType, "otro">,
  string
> = {
  collar: "/images/products/collar-qr.png",
  colgante: "/images/products/colgante-qr.png",
  iman: "/images/products/iman-qr.png",
  credencial: "/images/products/credencial-plastificada.png",
  sticker: "/images/products/sticker-qr.jpg",
};

export function getStoreProductImage(product: {
  slug: string;
  product_type: string;
  image_url?: string | null;
}): string | null {
  if (product.image_url?.trim()) {
    return product.image_url.trim();
  }

  const bySlug = STORE_PRODUCT_IMAGES_BY_SLUG[product.slug];
  if (bySlug) return bySlug;

  const type = product.product_type as StoreProductType;
  if (type !== "otro" && STORE_PRODUCT_IMAGES_BY_TYPE[type]) {
    return STORE_PRODUCT_IMAGES_BY_TYPE[type];
  }

  return null;
}
