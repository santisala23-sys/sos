/** Una URL por línea en el admin → array para la tienda. */
export function parseGalleryUrlsFromText(text: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }
  return urls;
}

export function formatGalleryUrlsForText(urls: string[] | null | undefined): string {
  if (!urls?.length) return "";
  return urls.join("\n");
}

export function normalizeGalleryUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((url) => url.trim())
    .filter(Boolean);
}

/** Sincroniza `image_url` (primera) y galería completa para guardar en DB. */
export function resolveStoreProductMedia(input: {
  image_url?: string | null;
  gallery_urls?: string[] | null;
  gallery_urls_text?: string;
}): { image_url: string | null; gallery_urls: string[] } {
  let urls =
    input.gallery_urls_text !== undefined
      ? parseGalleryUrlsFromText(input.gallery_urls_text)
      : normalizeGalleryUrls(input.gallery_urls);

  if (urls.length === 0 && input.image_url?.trim()) {
    urls = [input.image_url.trim()];
  }

  return {
    image_url: urls[0] ?? null,
    gallery_urls: urls,
  };
}

export function productGalleryUrlsForForm(product: {
  image_url?: string | null;
  gallery_urls?: unknown;
}): string {
  const fromDb = normalizeGalleryUrls(product.gallery_urls);
  if (fromDb.length > 0) return formatGalleryUrlsForText(fromDb);
  if (product.image_url?.trim()) return product.image_url.trim();
  return "";
}
