export type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

// Ordenado priorizando países de habla hispana / Latinoamérica.
export const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "UY", name: "Uruguay", dialCode: "+598", flag: "🇺🇾" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "PY", name: "Paraguay", dialCode: "+595", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", dialCode: "+591", flag: "🇧🇴" },
  { code: "PE", name: "Perú", dialCode: "+51", flag: "🇵🇪" },
  { code: "BR", name: "Brasil", dialCode: "+55", flag: "🇧🇷" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "EC", name: "Ecuador", dialCode: "+593", flag: "🇪🇨" },
  { code: "VE", name: "Venezuela", dialCode: "+58", flag: "🇻🇪" },
  { code: "MX", name: "México", dialCode: "+52", flag: "🇲🇽" },
  { code: "CR", name: "Costa Rica", dialCode: "+506", flag: "🇨🇷" },
  { code: "PA", name: "Panamá", dialCode: "+507", flag: "🇵🇦" },
  { code: "GT", name: "Guatemala", dialCode: "+502", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", dialCode: "+504", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", dialCode: "+503", flag: "🇸🇻" },
  { code: "NI", name: "Nicaragua", dialCode: "+505", flag: "🇳🇮" },
  { code: "DO", name: "República Dominicana", dialCode: "+1", flag: "🇩🇴" },
  { code: "CU", name: "Cuba", dialCode: "+53", flag: "🇨🇺" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1", flag: "🇵🇷" },
  { code: "ES", name: "España", dialCode: "+34", flag: "🇪🇸" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", dialCode: "+1", flag: "🇨🇦" },
  { code: "GB", name: "Reino Unido", dialCode: "+44", flag: "🇬🇧" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", dialCode: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
];

export const DEFAULT_COUNTRY_CODE = "AR";

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

/**
 * Dado un teléfono completo (ej: "+5491122334455"), intenta detectar el país
 * y separar el número local. Elige el prefijo más largo que coincida.
 */
export function splitPhone(phone: string | null | undefined): {
  country: Country;
  localNumber: string;
} {
  const fallback = getCountryByCode(DEFAULT_COUNTRY_CODE)!;
  const trimmed = (phone ?? "").trim();

  if (!trimmed.startsWith("+")) {
    return { country: fallback, localNumber: trimmed.replace(/[^\d]/g, "") };
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  const matches = COUNTRIES
    .filter((c) => digits.startsWith(c.dialCode.slice(1)))
    .sort((a, b) => b.dialCode.length - a.dialCode.length);

  const country = matches[0] ?? fallback;
  const localNumber = digits.slice(country.dialCode.length - 1);

  return { country, localNumber };
}
