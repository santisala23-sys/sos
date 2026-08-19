import type { PublicEmergencyProfile, QrProfile } from "@/types/database";

/** Convierte un perfil completo al shape público (sin teléfonos). Preferir findPublicProfileBySlug. */
export function toPublicEmergencyProfile(
  profile: QrProfile,
): PublicEmergencyProfile {
  return {
    slug: profile.slug,
    profile_type: profile.profile_type,
    beneficiary_name: profile.beneficiary_name,
    emergency_contact_name: profile.emergency_contact_name,
    secondary_contact_name: profile.secondary_contact_name,
    instructions: profile.instructions,
    medical_notes: profile.medical_notes,
    allergies: profile.allergies,
    blood_type: profile.blood_type,
    health_insurance: profile.health_insurance,
    clinical_pdf_filename: profile.clinical_pdf_filename,
    clinical_pdf_uploaded_at: profile.clinical_pdf_uploaded_at,
    is_active: profile.is_active,
    created_at: profile.created_at,
    avatar_b64: profile.avatar_b64,
    avatar_mime: profile.avatar_mime,
  };
}
