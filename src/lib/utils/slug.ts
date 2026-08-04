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

/** Vista del tutor: mismo contenido público sin registrar escaneo. */
export function getTutorPublicPreviewUrl(profileId: string): string {
  return `${getAppUrl()}/dashboard/perfiles/${profileId}/vista-publica`;
}

export function getPetHealthBookUrl(profileId: string): string {
  return `${getAppUrl()}/dashboard/perfiles/${profileId}/libreta`;
}
