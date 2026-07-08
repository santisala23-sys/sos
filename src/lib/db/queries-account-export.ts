import { getSql } from "@/lib/db/index";

export async function getAccountExport(userId: string) {
  const sql = getSql();

  const userRows = await sql`
    SELECT
      id, email, full_name,
      created_at, updated_at,
      accepted_terms_at, terms_version, privacy_policy_version,
      declared_eligible_at, declared_eligible_version,
      deletion_requested_at, deletion_scheduled_for, deleted_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  const user = userRows[0] as Record<string, unknown> | undefined;
  if (!user) {
    return { user: null, profiles: [], scans: [], messages: [], pushSubscriptions: [] };
  }

  const profiles = (await sql`
    SELECT
      id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
    FROM qr_profiles
    WHERE tutor_id = ${userId}
    ORDER BY created_at DESC
  `) as Record<string, unknown>[];

  const scans = (await sql`
    SELECT
      sl.*,
      qp.slug AS profile_slug,
      qp.beneficiary_name
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE qp.tutor_id = ${userId}
    ORDER BY sl.scanned_at DESC
  `) as Record<string, unknown>[];

  const messages = (await sql`
    SELECT
      sm.*,
      qp.slug AS profile_slug
    FROM scan_messages sm
    JOIN scan_logs sl ON sl.id = sm.scan_log_id
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE qp.tutor_id = ${userId}
    ORDER BY sm.created_at ASC
  `) as Record<string, unknown>[];

  const pushSubscriptions = (await sql`
    SELECT endpoint, p256dh, auth, created_at
    FROM push_subscriptions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as Record<string, unknown>[];

  return {
    exportedAt: new Date().toISOString(),
    user,
    profiles,
    scans,
    messages,
    pushSubscriptions,
  };
}

