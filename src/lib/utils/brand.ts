export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "somososme@gmail.com";

export const INSTAGRAM_HANDLE =
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "sosme.ar";

export const TIKTOK_HANDLE =
  process.env.NEXT_PUBLIC_TIKTOK_HANDLE ?? "sosme.ar";

export function getInstagramUrl(): string {
  return `https://instagram.com/${INSTAGRAM_HANDLE}`;
}

export function getTikTokUrl(): string {
  return `https://tiktok.com/@${TIKTOK_HANDLE}`;
}

export function getContactMailtoUrl(subject?: string): string {
  const base = `mailto:${CONTACT_EMAIL}`;
  return subject
    ? `${base}?subject=${encodeURIComponent(subject)}`
    : base;
}
