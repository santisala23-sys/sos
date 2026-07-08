import { CONTACT_EMAIL } from "@/lib/utils/brand";
import { getAppUrl } from "@/lib/utils/app-url";

export type LegalEntitySettings = {
  legal_name: string | null;
  cuit: string | null;
  address: string | null;
  jurisdiction: string | null;
  privacy_email: string | null;
  updated_at: string | null;
};

export const EMPTY_LEGAL_ENTITY_SETTINGS: LegalEntitySettings = {
  legal_name: null,
  cuit: null,
  address: null,
  jurisdiction: null,
  privacy_email: null,
  updated_at: null,
};

export type LegalEntityVariableKey =
  | "legal_name"
  | "cuit"
  | "address"
  | "jurisdiction"
  | "privacy_email"
  | "website_url";

const PENDING_LABELS: Record<LegalEntityVariableKey, string> = {
  legal_name: "Razón social pendiente",
  cuit: "CUIT pendiente",
  address: "Domicilio pendiente",
  jurisdiction: "Jurisdicción pendiente",
  privacy_email: CONTACT_EMAIL,
  website_url: getAppUrl(),
};

export function resolveLegalVariables(
  settings: LegalEntitySettings,
): Record<LegalEntityVariableKey, string> {
  return {
    legal_name: settings.legal_name?.trim() || PENDING_LABELS.legal_name,
    cuit: settings.cuit?.trim() || PENDING_LABELS.cuit,
    address: settings.address?.trim() || PENDING_LABELS.address,
    jurisdiction: settings.jurisdiction?.trim() || PENDING_LABELS.jurisdiction,
    privacy_email: settings.privacy_email?.trim() || PENDING_LABELS.privacy_email,
    website_url: getAppUrl(),
  };
}

export function applyLegalVariables(
  content: string,
  settings: LegalEntitySettings,
): string {
  const vars = resolveLegalVariables(settings);
  return content.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    if (key in vars) {
      return vars[key as LegalEntityVariableKey];
    }
    return match;
  });
}

export function isLegalEntityComplete(settings: LegalEntitySettings): boolean {
  return Boolean(
    settings.legal_name?.trim() &&
      settings.cuit?.trim() &&
      settings.address?.trim() &&
      settings.jurisdiction?.trim(),
  );
}
