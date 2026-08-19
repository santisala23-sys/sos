import { randomBytes } from "node:crypto";
import { getAppUrl } from "@/lib/utils/app-url";

/** Alfabeto URL-safe estándar de NanoID (64 caracteres). */
const NANOID_ALPHABET =
  "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug opaco de 21 caracteres para URLs públicas no enumerables. */
export function generateOpaqueSlug(size = 21): string {
  const bytes = randomBytes(size);
  let id = "";
  for (let i = 0; i < size; i++) {
    id += NANOID_ALPHABET[bytes[i]! % NANOID_ALPHABET.length];
  }
  return id;
}

/** Genera slug para perfiles nuevos (NanoID opaco). */
export function generateSlug(_beneficiaryName?: string): string {
  return generateOpaqueSlug(21);
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

/** Slug legado: nombre-sufijo (siempre incluye al menos un guión). */
export function isLegacySlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)+$/.test(slug);
}

/** NanoID opaco de 21 caracteres (perfiles nuevos). */
export function isOpaqueSlug(slug: string): boolean {
  return /^[A-Za-z0-9_-]{21}$/.test(slug);
}

/** Valida slug contra el constraint dual de la base de datos. */
export function isValidProfileSlug(slug: string): boolean {
  return isLegacySlug(slug) || isOpaqueSlug(slug);
}
