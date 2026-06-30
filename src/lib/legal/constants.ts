export const LEGAL_VERSION = "1.0";
export const LEGAL_EFFECTIVE_DATE = "30 de junio de 2026";

export const LEGAL_DOCUMENTS = {
  terminos: {
    title: "Términos y Condiciones de Uso",
    file: "terminos-y-condiciones.md",
  },
  privacidad: {
    title: "Política de Privacidad",
    file: "politica-de-privacidad.md",
  },
  cookies: {
    title: "Política de Cookies y Tecnologías Similares",
    file: "politica-de-cookies.md",
  },
  "aviso-datos-sensibles": {
    title: "Aviso de Datos Sensibles y Consentimiento",
    file: "aviso-datos-sensibles.md",
  },
  "aviso-escaneadores-publicos": {
    title: "Aviso para Escáneres Públicos",
    file: "aviso-escaneadores-publicos.md",
  },
  "retencion-datos": {
    title: "Política de Retención y Eliminación de Datos",
    file: "politica-retencion-eliminacion.md",
  },
  "aviso-emergencia": {
    title: "Descargo de Responsabilidad de Emergencia",
    file: "descargo-responsabilidad-emergencia.md",
  },
} as const;

export type LegalDocumentSlug = keyof typeof LEGAL_DOCUMENTS;

export const LEGAL_FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/retencion-datos", label: "Retención de datos" },
  { href: "/aviso-emergencia", label: "Aviso de emergencia" },
];

export const TERMS_PENDING_COOKIE = "sos_terms_pending";
export const ELIGIBLE_PENDING_COOKIE = "sos_eligible_pending";
