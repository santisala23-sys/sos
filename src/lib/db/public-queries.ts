import { getSql } from "@/lib/db/index";
import { ensureDeferredMigrations } from "@/lib/db/ensure-schema";
import { isValidProfileSlug } from "@/lib/utils/slug";
import type { PublicEmergencyProfile } from "@/types/database";

/**
 * Consulta pública con SELECT estricto: sin id, tutor_id, teléfonos ni ubicación guardada.
 */
export async function findPublicProfileBySlug(
  slug: string,
  activeOnly = true,
): Promise<PublicEmergencyProfile | null> {
  if (!isValidProfileSlug(slug)) return null;
  await ensureDeferredMigrations();
  const sql = getSql();

  const rows = activeOnly
    ? await sql`
        SELECT
          slug,
          profile_type,
          beneficiary_name,
          emergency_contact_name,
          secondary_contact_name,
          instructions,
          medical_notes,
          allergies,
          blood_type,
          clinical_pdf_filename,
          clinical_pdf_uploaded_at,
          is_active,
          created_at,
          CASE WHEN avatar_data IS NOT NULL THEN encode(avatar_data, 'base64') ELSE NULL END AS avatar_b64,
          avatar_mime
        FROM qr_profiles
        WHERE slug = ${slug} AND is_active = TRUE
        LIMIT 1
      `
    : await sql`
        SELECT
          slug,
          profile_type,
          beneficiary_name,
          emergency_contact_name,
          secondary_contact_name,
          instructions,
          medical_notes,
          allergies,
          blood_type,
          clinical_pdf_filename,
          clinical_pdf_uploaded_at,
          is_active,
          created_at,
          CASE WHEN avatar_data IS NOT NULL THEN encode(avatar_data, 'base64') ELSE NULL END AS avatar_b64,
          avatar_mime
        FROM qr_profiles
        WHERE slug = ${slug}
        LIMIT 1
      `;

  return (rows[0] as PublicEmergencyProfile | undefined) ?? null;
}

export type ProfileContactRow = {
  beneficiary_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  secondary_contact_name: string | null;
  secondary_contact_phone: string | null;
};

/** Solo para uso server-side en /api/contact. Nunca enviar al cliente como JSON de perfil. */
export async function findContactInfoBySlug(
  slug: string,
): Promise<ProfileContactRow | null> {
  if (!isValidProfileSlug(slug)) return null;
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT
      beneficiary_name,
      emergency_contact_name,
      emergency_contact_phone,
      secondary_contact_name,
      secondary_contact_phone
    FROM qr_profiles
    WHERE slug = ${slug} AND is_active = TRUE
    LIMIT 1
  `;
  return (rows[0] as ProfileContactRow | undefined) ?? null;
}
