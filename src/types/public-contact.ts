/** Respuesta pública de /api/contact (sin números en texto plano). */
export type PublicContactLink = {
  name: string;
  telUrl: string;
  whatsappUrl: string;
};

export type PublicContactLinksResponse = {
  primary: PublicContactLink;
  secondary: PublicContactLink | null;
};
