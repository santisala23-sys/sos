/** Etiqueta de Plan Pro que acompaña al descuento en la tienda. */
export function getStoreProPromoLabel(product: {
  slug: string;
  name: string;
}): string | null {
  const name = product.name.toLowerCase();
  const slug = product.slug;

  if (slug.startsWith("collar") || name.includes("collar")) {
    return "1 año Pro (libreta sanitaria + hasta 4 tutores)";
  }

  if (
    slug === "colgante-qr" ||
    slug === "sticker-qr" ||
    slug === "credencial-plastificada" ||
    slug === "tarjeta-credencial-qr" ||
    name.includes("credencial") ||
    name.includes("sticker")
  ) {
    return "1 año Pro (hasta 4 tutores)";
  }

  return null;
}
