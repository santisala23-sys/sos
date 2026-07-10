import { getAppUrl } from "@/lib/utils/app-url";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateSlug(beneficiaryName: string): string {
  const base = slugify(beneficiaryName) || "perfil";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export function getPublicProfileUrl(slug: string): string {
  return `${getAppUrl()}/p/${slug}`;
}
