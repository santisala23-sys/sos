import { getAppUrl } from "@/lib/utils/app-url";
import { slugify } from "@/lib/utils/slug";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeActivationCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateActivationCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export function generateProductSlug(prefix: string): string {
  const base = slugify(prefix) || "producto";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export function getActivationUrl(code: string): string {
  return `${getAppUrl()}/activar/${normalizeActivationCode(code)}`;
}
