import type {
  AlertType,
  MessageSender,
  ProfileType,
  QrProfile,
  ScanLog,
  ScanMessage,
  ScanLogWithProfile,
  User,
} from "@/types/database";
import { getSql } from "@/lib/db/index";

type UserRow = User & {
  password_hash: string | null;
  google_id: string | null;
  avatar_url: string | null;
  deletion_requested_at?: string | null;
  deleted_at?: string | null;
  email_verified_at?: string | null;
};

export async function findUserByEmail(
  email: string,
): Promise<UserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, email, password_hash, google_id, avatar_url, full_name, updated_at, created_at,
      deletion_requested_at, deleted_at, email_verified_at
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

export type EmailVerificationRow = {
  email: string;
  full_name: string | null;
  email_verified_at: string | null;
  email_verification_code_hash: string | null;
  email_verification_expires_at: string | null;
  email_verification_sent_at: string | null;
  email_verification_attempts: number;
};

export async function getEmailVerification(
  userId: string,
): Promise<EmailVerificationRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      email,
      full_name,
      email_verified_at,
      email_verification_code_hash,
      email_verification_expires_at,
      email_verification_sent_at,
      email_verification_attempts
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return (rows[0] as EmailVerificationRow | undefined) ?? null;
}

export async function setEmailVerificationCode(
  userId: string,
  codeHash: string,
  expiresAt: Date,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET
      email_verification_code_hash = ${codeHash},
      email_verification_expires_at = ${expiresAt.toISOString()},
      email_verification_sent_at = NOW(),
      email_verification_attempts = 0
    WHERE id = ${userId}
  `;
}

export async function incrementEmailVerificationAttempts(
  userId: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET email_verification_attempts = email_verification_attempts + 1
    WHERE id = ${userId}
  `;
}

export async function markEmailVerified(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET
      email_verified_at = COALESCE(email_verified_at, NOW()),
      email_verification_code_hash = NULL,
      email_verification_expires_at = NULL,
      email_verification_attempts = 0
    WHERE id = ${userId}
  `;
}

export async function findUserByGoogleId(
  googleId: string,
): Promise<UserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, google_id, avatar_url, full_name, updated_at, created_at
    FROM users
    WHERE google_id = ${googleId}
    LIMIT 1
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
  legal?: {
    termsVersion: string;
    privacyVersion: string;
    eligibleVersion: string;
  },
): Promise<User> {
  const sql = getSql();
  const acceptedAt = legal ? new Date().toISOString() : null;
  const rows = await sql`
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      accepted_terms_at,
      terms_version,
      privacy_policy_version,
      declared_eligible_at,
      declared_eligible_version
    )
    VALUES (
      ${email.toLowerCase()},
      ${passwordHash},
      ${fullName},
      ${acceptedAt},
      ${legal?.termsVersion ?? null},
      ${legal?.privacyVersion ?? null},
      ${acceptedAt},
      ${legal?.eligibleVersion ?? null}
    )
    RETURNING id, email, full_name, updated_at, created_at
  `;
  return rows[0] as User;
}

export async function recordTermsAcceptance(
  userId: string,
  termsVersion: string,
  privacyVersion: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET
      accepted_terms_at = COALESCE(accepted_terms_at, NOW()),
      terms_version = ${termsVersion},
      privacy_policy_version = ${privacyVersion}
    WHERE id = ${userId}
  `;
}

export async function recordEligibleDeclaration(
  userId: string,
  eligibleVersion: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET
      declared_eligible_at = COALESCE(declared_eligible_at, NOW()),
      declared_eligible_version = ${eligibleVersion}
    WHERE id = ${userId}
  `;
}

export async function findUserLegalStatus(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT
      accepted_terms_at,
      terms_version,
      privacy_policy_version,
      declared_eligible_at,
      declared_eligible_version
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return (
    (rows[0] as
      | {
          accepted_terms_at: string | null;
          terms_version: string | null;
          privacy_policy_version: string | null;
          declared_eligible_at: string | null;
          declared_eligible_version: string | null;
        }
      | undefined) ?? null
  );
}

export async function createGoogleUser(data: {
  email: string;
  googleId: string;
  fullName: string;
  avatarUrl?: string | null;
  legal?: {
    termsVersion: string;
    privacyVersion: string;
    eligibleVersion: string;
  };
}): Promise<User> {
  const sql = getSql();
  const acceptedAt = data.legal ? new Date().toISOString() : null;
  const rows = await sql`
    INSERT INTO users (
      email,
      google_id,
      full_name,
      avatar_url,
      email_verified_at,
      accepted_terms_at,
      terms_version,
      privacy_policy_version,
      declared_eligible_at,
      declared_eligible_version
    )
    VALUES (
      ${data.email.toLowerCase()},
      ${data.googleId},
      ${data.fullName},
      ${data.avatarUrl ?? null},
      NOW(),
      ${acceptedAt},
      ${data.legal?.termsVersion ?? null},
      ${data.legal?.privacyVersion ?? null},
      ${acceptedAt},
      ${data.legal?.eligibleVersion ?? null}
    )
    RETURNING id, email, full_name, updated_at, created_at
  `;
  return rows[0] as User;
}

export async function linkGoogleAccount(
  userId: string,
  data: {
    googleId: string;
    fullName?: string;
    avatarUrl?: string | null;
  },
): Promise<User> {
  const sql = getSql();
  const rows = await sql`
    UPDATE users
    SET
      google_id = ${data.googleId},
      full_name = COALESCE(NULLIF(${data.fullName ?? ""}, ""), full_name),
      avatar_url = COALESCE(${data.avatarUrl ?? null}, avatar_url)
    WHERE id = ${userId}
    RETURNING id, email, full_name, updated_at, created_at
  `;
  return rows[0] as User;
}

export async function findOrCreateGoogleUser(
  profile: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  },
  legal?: {
    termsVersion: string;
    privacyVersion: string;
    eligibleVersion: string;
  },
): Promise<User> {
  const byGoogle = await findUserByGoogleId(profile.id);
  if (byGoogle) return byGoogle;

  const byEmail = await findUserByEmail(profile.email);
  if (byEmail) {
    return linkGoogleAccount(byEmail.id, {
      googleId: profile.id,
      fullName: profile.name,
      avatarUrl: profile.picture,
    });
  }

  return createGoogleUser({
    email: profile.email,
    googleId: profile.id,
    fullName: profile.name,
    avatarUrl: profile.picture,
    legal,
  });
}

export async function listQrProfilesByTutor(tutorId: string): Promise<QrProfile[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
    FROM qr_profiles
    WHERE tutor_id = ${tutorId}
    ORDER BY created_at DESC
  `;
  return rows as QrProfile[];
}

export async function findQrProfileBySlug(
  slug: string,
  activeOnly = true,
): Promise<QrProfile | null> {
  const sql = getSql();
  const rows = activeOnly
    ? await sql`
        SELECT
          id, tutor_id, slug, profile_type, beneficiary_name,
          emergency_contact_name, emergency_contact_phone,
          secondary_contact_name, secondary_contact_phone,
          instructions, medical_notes, allergies, blood_type,
          clinical_pdf_filename, clinical_pdf_uploaded_at,
          is_active, created_at
        FROM qr_profiles
        WHERE slug = ${slug} AND is_active = TRUE
        LIMIT 1
      `
    : await sql`
        SELECT
          id, tutor_id, slug, profile_type, beneficiary_name,
          emergency_contact_name, emergency_contact_phone,
          secondary_contact_name, secondary_contact_phone,
          instructions, medical_notes, allergies, blood_type,
          clinical_pdf_filename, clinical_pdf_uploaded_at,
          is_active, created_at
        FROM qr_profiles
        WHERE slug = ${slug}
        LIMIT 1
      `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function findQrProfileById(id: string): Promise<QrProfile | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
    FROM qr_profiles
    WHERE id = ${id}
    LIMIT 1
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function findActiveQrProfileById(
  id: string,
): Promise<QrProfile | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
    FROM qr_profiles
    WHERE id = ${id} AND is_active = TRUE
    LIMIT 1
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function createQrProfile(
  data: {
    tutor_id: string;
    slug: string;
    profile_type?: ProfileType;
    beneficiary_name: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    secondary_contact_name?: string | null;
    secondary_contact_phone?: string | null;
    instructions: string;
    medical_notes?: string;
    allergies?: string;
    blood_type?: string | null;
    is_active?: boolean;
    sensitive_data_consent_at?: string | null;
    sensitive_data_consent_version?: string | null;
  },
): Promise<QrProfile> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO qr_profiles (
      tutor_id, slug, profile_type, beneficiary_name, emergency_contact_name,
      emergency_contact_phone, secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type, is_active,
      sensitive_data_consent_at, sensitive_data_consent_version
    )
    VALUES (
      ${data.tutor_id},
      ${data.slug},
      ${data.profile_type ?? "person"},
      ${data.beneficiary_name},
      ${data.emergency_contact_name},
      ${data.emergency_contact_phone},
      ${data.secondary_contact_name ?? null},
      ${data.secondary_contact_phone ?? null},
      ${data.instructions},
      ${data.medical_notes ?? ""},
      ${data.allergies ?? ""},
      ${data.blood_type ?? null},
      ${data.is_active ?? true},
      ${data.sensitive_data_consent_at ?? null},
      ${data.sensitive_data_consent_version ?? null}
    )
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
  `;
  return rows[0] as QrProfile;
}

export async function updateQrProfile(
  id: string,
  tutorId: string,
  data: Partial<
      Pick<
      QrProfile,
      | "beneficiary_name"
      | "profile_type"
      | "emergency_contact_name"
      | "emergency_contact_phone"
      | "secondary_contact_name"
      | "secondary_contact_phone"
      | "instructions"
      | "medical_notes"
      | "allergies"
      | "blood_type"
      | "is_active"
      | "sensitive_data_consent_at"
      | "sensitive_data_consent_version"
    >
  >,
): Promise<QrProfile | null> {
  const sql = getSql();
  const existing = await findQrProfileById(id);
  if (!existing || existing.tutor_id !== tutorId) return null;

  const rows = await sql`
    UPDATE qr_profiles
    SET
      beneficiary_name = ${data.beneficiary_name ?? existing.beneficiary_name},
      profile_type = ${data.profile_type ?? existing.profile_type ?? "person"},
      emergency_contact_name = ${data.emergency_contact_name ?? existing.emergency_contact_name},
      emergency_contact_phone = ${data.emergency_contact_phone ?? existing.emergency_contact_phone},
      secondary_contact_name = ${data.secondary_contact_name !== undefined ? data.secondary_contact_name : existing.secondary_contact_name},
      secondary_contact_phone = ${data.secondary_contact_phone !== undefined ? data.secondary_contact_phone : existing.secondary_contact_phone},
      instructions = ${data.instructions ?? existing.instructions},
      medical_notes = ${data.medical_notes ?? existing.medical_notes ?? ""},
      allergies = ${data.allergies !== undefined ? data.allergies : existing.allergies ?? ""},
      blood_type = ${data.blood_type !== undefined ? data.blood_type : existing.blood_type ?? null},
      is_active = ${data.is_active ?? existing.is_active},
      sensitive_data_consent_at = ${data.sensitive_data_consent_at !== undefined ? data.sensitive_data_consent_at : existing.sensitive_data_consent_at ?? null},
      sensitive_data_consent_version = ${data.sensitive_data_consent_version !== undefined ? data.sensitive_data_consent_version : existing.sensitive_data_consent_version ?? null}
    WHERE id = ${id} AND tutor_id = ${tutorId}
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function deleteQrProfile(
  id: string,
  tutorId: string,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM qr_profiles
    WHERE id = ${id} AND tutor_id = ${tutorId}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function createScanLog(data: {
  profile_id: string;
  user_agent?: string | null;
  alert_type?: AlertType;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<Pick<ScanLog, "id" | "scanned_at">> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO scan_logs (profile_id, user_agent, alert_type, latitude, longitude)
    VALUES (
      ${data.profile_id},
      ${data.user_agent ?? null},
      ${data.alert_type ?? "scan"},
      ${data.latitude ?? null},
      ${data.longitude ?? null}
    )
    RETURNING id, scanned_at
  `;
  return (rows[0] as Pick<ScanLog, "id" | "scanned_at">);
}

export async function listScanLogsByTutor(
  tutorId: string,
  limit = 50,
): Promise<ScanLogWithProfile[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      sl.*,
      qp.beneficiary_name,
      qp.slug
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE qp.tutor_id = ${tutorId}
    ORDER BY sl.scanned_at DESC
    LIMIT ${limit}
  `;
  return rows as ScanLogWithProfile[];
}

export async function countUnreadScanLogs(tutorId: string): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE qp.tutor_id = ${tutorId}
      AND sl.read_at IS NULL
  `;
  return (rows[0] as { count: number }).count;
}

export async function findScanLogForTutor(
  scanLogId: string,
  tutorId: string,
): Promise<ScanLogWithProfile | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.slug
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId} AND qp.tutor_id = ${tutorId}
    LIMIT 1
  `;
  return (rows[0] as ScanLogWithProfile | undefined) ?? null;
}

export async function markScanLogRead(
  scanLogId: string,
  tutorId: string,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE scan_logs sl
    SET read_at = NOW()
    FROM qr_profiles qp
    WHERE sl.id = ${scanLogId}
      AND sl.profile_id = qp.id
      AND qp.tutor_id = ${tutorId}
    RETURNING sl.id
  `;
  return rows.length > 0;
}

export async function findScanLogById(
  scanLogId: string,
): Promise<(ScanLog & { beneficiary_name: string }) | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId}
    LIMIT 1
  `;
  return (rows[0] as (ScanLog & { beneficiary_name: string }) | undefined) ?? null;
}

export async function addScannerNote(
  scanLogId: string,
  note: string,
): Promise<(ScanLog & { beneficiary_name: string; emergency_contact_name: string; emergency_contact_phone: string }) | null> {
  const sql = getSql();
  await sql`
    UPDATE scan_logs
    SET
      scanner_note = ${note.trim()},
      note_added_at = NOW(),
      read_at = NULL
    WHERE id = ${scanLogId}
  `;
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.emergency_contact_name, qp.emergency_contact_phone
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId}
    LIMIT 1
  `;
  return (rows[0] as (ScanLog & { beneficiary_name: string; emergency_contact_name: string; emergency_contact_phone: string }) | undefined) ?? null;
}

export async function updateScanLogLocation(
  scanLogId: string,
  latitude: number,
  longitude: number,
): Promise<{
  scanned_at: string;
  profile_id: string;
  beneficiary_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
} | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE scan_logs
    SET latitude = ${latitude}, longitude = ${longitude}, read_at = NULL
    WHERE id = ${scanLogId}
    RETURNING id, scanned_at, profile_id
  `;
  const log = rows[0] as
    | { id: string; scanned_at: string; profile_id: string }
    | undefined;
  if (!log) return null;

  const profileRows = await sql`
    SELECT beneficiary_name, emergency_contact_name, emergency_contact_phone
    FROM qr_profiles
    WHERE id = ${log.profile_id}
    LIMIT 1
  `;
  const profile = profileRows[0] as
    | {
        beneficiary_name: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
      }
    | undefined;
  if (!profile) return null;

  return {
    scanned_at: log.scanned_at,
    profile_id: log.profile_id,
    ...profile,
  };
}

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<"ok" | "conflict"> {
  const sql = getSql();
  const existing = await sql`
    SELECT user_id FROM push_subscriptions WHERE endpoint = ${subscription.endpoint} LIMIT 1
  `;
  const row = existing[0] as { user_id: string } | undefined;
  if (row && row.user_id !== userId) {
    return "conflict";
  }

  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (
      ${userId},
      ${subscription.endpoint},
      ${subscription.keys.p256dh},
      ${subscription.keys.auth}
    )
    ON CONFLICT (endpoint) DO UPDATE
      SET p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth
      WHERE push_subscriptions.user_id = ${userId}
  `;
  return "ok";
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    DELETE FROM push_subscriptions
    WHERE user_id = ${userId} AND endpoint = ${endpoint}
  `;
}

export async function listPushSubscriptionsByUser(userId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT endpoint, p256dh, auth
    FROM push_subscriptions
    WHERE user_id = ${userId}
  `;
  return rows as { endpoint: string; p256dh: string; auth: string }[];
}

export async function listScanMessages(scanLogId: string): Promise<ScanMessage[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id,
      scan_log_id,
      sender,
      body,
      created_at,
      media_type,
      media_mime,
      media_filename,
      CASE
        WHEN media_data IS NOT NULL THEN encode(media_data, 'base64')
        ELSE NULL
      END AS media_b64
    FROM scan_messages
    WHERE scan_log_id = ${scanLogId}
    ORDER BY created_at ASC
  `;
  return rows as ScanMessage[];
}

export async function findScanLogBySlugAccess(
  scanLogId: string,
  slug: string,
): Promise<(ScanLog & { beneficiary_name: string; tutor_id: string }) | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.tutor_id
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId} AND qp.slug = ${slug} AND qp.is_active = TRUE
    LIMIT 1
  `;
  return (rows[0] as (ScanLog & { beneficiary_name: string; tutor_id: string }) | undefined) ?? null;
}

const MAX_SCAN_MEDIA_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_AUDIO_MIMES = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
]);

export type ScanMessageMediaInput = {
  type: "image" | "audio";
  mime: string;
  filename: string;
  base64Data: string;
};

function assertValidScanMedia(media: ScanMessageMediaInput): void {
  const mime = media.mime.toLowerCase().split(";")[0]?.trim() ?? "";
  const allowed =
    media.type === "image" ? ALLOWED_IMAGE_MIMES : ALLOWED_AUDIO_MIMES;
  if (!allowed.has(mime)) {
    throw new Error(
      media.type === "image"
        ? "Formato de imagen no permitido (JPEG, PNG, WebP o GIF)"
        : "Formato de audio no permitido",
    );
  }
  const byteLength = Buffer.from(media.base64Data, "base64").byteLength;
  if (byteLength <= 0) {
    throw new Error("Archivo vacío");
  }
  if (byteLength > MAX_SCAN_MEDIA_BYTES) {
    throw new Error("El archivo supera el máximo de 2 MB");
  }
}

export async function addScanMessage(
  scanLogId: string,
  sender: MessageSender,
  body: string,
  media?: ScanMessageMediaInput | null,
): Promise<ScanMessage | null> {
  const sql = getSql();
  const trimmed = body.trim();
  if (!trimmed && !media) {
    throw new Error("Mensaje o archivo requerido");
  }

  let mediaType: string | null = null;
  let mediaMime: string | null = null;
  let mediaFilename: string | null = null;
  let mediaB64: string | null = null;

  if (media) {
    assertValidScanMedia(media);
    mediaType = media.type;
    mediaMime = media.mime.toLowerCase().split(";")[0]?.trim() ?? media.mime;
    mediaFilename =
      media.filename.trim() ||
      `${media.type}.${media.type === "image" ? "jpg" : "webm"}`;
    mediaB64 = media.base64Data;
  }

  const noteForLog =
    trimmed ||
    (mediaType === "image" ? "[Foto]" : mediaType === "audio" ? "[Audio]" : "");

  const rows = mediaB64
    ? await sql`
        INSERT INTO scan_messages (
          scan_log_id, sender, body,
          media_type, media_mime, media_filename, media_data
        )
        VALUES (
          ${scanLogId},
          ${sender},
          ${trimmed},
          ${mediaType},
          ${mediaMime},
          ${mediaFilename},
          decode(${mediaB64}, 'base64')
        )
        RETURNING
          id, scan_log_id, sender, body, created_at,
          media_type, media_mime, media_filename,
          encode(media_data, 'base64') AS media_b64
      `
    : await sql`
        INSERT INTO scan_messages (scan_log_id, sender, body)
        VALUES (${scanLogId}, ${sender}, ${trimmed})
        RETURNING
          id, scan_log_id, sender, body, created_at,
          media_type, media_mime, media_filename,
          NULL::text AS media_b64
      `;

  const message = rows[0] as ScanMessage | undefined;
  if (!message) return null;

  if (sender === "public") {
    await sql`
      UPDATE scan_logs
      SET
        scanner_note = ${noteForLog},
        note_added_at = NOW(),
        read_at = NULL
      WHERE id = ${scanLogId}
    `;
  }

  return message;
}

export async function getScanLogContextForNotify(scanLogId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT
      sl.*,
      qp.beneficiary_name,
      qp.tutor_id,
      qp.emergency_contact_name,
      qp.emergency_contact_phone
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId}
    LIMIT 1
  `;
  return (rows[0] as
    | (ScanLog & {
        beneficiary_name: string;
        tutor_id: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
      })
    | undefined) ?? null;
}

const MAX_CLINICAL_PDF_BYTES = 5 * 1024 * 1024;

export async function setClinicalPdf(
  profileId: string,
  tutorId: string,
  base64Data: string,
  filename: string,
): Promise<QrProfile | null> {
  const byteLength = Buffer.from(base64Data, "base64").byteLength;
  if (byteLength > MAX_CLINICAL_PDF_BYTES) {
    throw new Error("PDF demasiado grande (máx. 5 MB)");
  }

  const sql = getSql();
  const existing = await findQrProfileById(profileId);
  if (!existing || existing.tutor_id !== tutorId) return null;

  const rows = await sql`
    UPDATE qr_profiles
    SET
      clinical_pdf = decode(${base64Data}, 'base64'),
      clinical_pdf_filename = ${filename},
      clinical_pdf_uploaded_at = NOW()
    WHERE id = ${profileId} AND tutor_id = ${tutorId}
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function clearClinicalPdf(
  profileId: string,
  tutorId: string,
): Promise<QrProfile | null> {
  const sql = getSql();
  const existing = await findQrProfileById(profileId);
  if (!existing || existing.tutor_id !== tutorId) return null;

  const rows = await sql`
    UPDATE qr_profiles
    SET
      clinical_pdf = NULL,
      clinical_pdf_filename = NULL,
      clinical_pdf_uploaded_at = NULL
    WHERE id = ${profileId} AND tutor_id = ${tutorId}
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, blood_type,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
      sensitive_data_consent_at, sensitive_data_consent_version,
      is_active, created_at
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function getClinicalPdfBySlug(slug: string): Promise<{
  filename: string;
  data: Buffer;
} | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT clinical_pdf_filename, encode(clinical_pdf, 'base64') AS clinical_pdf_b64
    FROM qr_profiles
    WHERE slug = ${slug} AND is_active = TRUE AND clinical_pdf IS NOT NULL
    LIMIT 1
  `;
  const row = rows[0] as
    | { clinical_pdf_filename: string; clinical_pdf_b64: string }
    | undefined;
  if (!row?.clinical_pdf_filename || !row.clinical_pdf_b64) return null;
  return {
    filename: row.clinical_pdf_filename,
    data: Buffer.from(row.clinical_pdf_b64, "base64"),
  };
}

export async function getClinicalPdfForTutor(
  profileId: string,
  tutorId: string,
): Promise<{ filename: string; data: Buffer } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT clinical_pdf_filename, encode(clinical_pdf, 'base64') AS clinical_pdf_b64
    FROM qr_profiles
    WHERE id = ${profileId} AND tutor_id = ${tutorId} AND clinical_pdf IS NOT NULL
    LIMIT 1
  `;
  const row = rows[0] as
    | { clinical_pdf_filename: string; clinical_pdf_b64: string }
    | undefined;
  if (!row?.clinical_pdf_filename || !row.clinical_pdf_b64) return null;
  return {
    filename: row.clinical_pdf_filename,
    data: Buffer.from(row.clinical_pdf_b64, "base64"),
  };
}

export async function saveScannerPushSubscription(
  scanLogId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO scanner_push_subscriptions (scan_log_id, endpoint, p256dh, auth)
    VALUES (
      ${scanLogId},
      ${subscription.endpoint},
      ${subscription.keys.p256dh},
      ${subscription.keys.auth}
    )
    ON CONFLICT (endpoint) DO UPDATE
      SET scan_log_id = EXCLUDED.scan_log_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth
  `;
}

export async function deleteScannerPushSubscription(
  scanLogId: string,
  endpoint: string,
): Promise<void> {
  const sql = getSql();
  await sql`
    DELETE FROM scanner_push_subscriptions
    WHERE scan_log_id = ${scanLogId} AND endpoint = ${endpoint}
  `;
}

export async function listScannerPushSubscriptions(scanLogId: string) {
  const sql = getSql();
  const rows = await sql`
    SELECT endpoint, p256dh, auth
    FROM scanner_push_subscriptions
    WHERE scan_log_id = ${scanLogId}
  `;
  return rows as { endpoint: string; p256dh: string; auth: string }[];
}

// ---------------------------------------------------------------------------
// Admin / observabilidad
// ---------------------------------------------------------------------------

export type AdminOverviewStats = {
  totalUsers: number;
  totalProfiles: number;
  activeProfiles: number;
  totalScans: number;
  scansToday: number;
  scansWeek: number;
  sosCount: number;
  unreadScans: number;
  apiRequests24h: number;
  apiErrors24h: number;
  securityEvents24h: number;
  pushSubscriptions: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM qr_profiles) AS total_profiles,
      (SELECT COUNT(*)::int FROM qr_profiles WHERE is_active = TRUE) AS active_profiles,
      (SELECT COUNT(*)::int FROM scan_logs) AS total_scans,
      (SELECT COUNT(*)::int FROM scan_logs WHERE scanned_at >= NOW() - INTERVAL '24 hours') AS scans_today,
      (SELECT COUNT(*)::int FROM scan_logs WHERE scanned_at >= NOW() - INTERVAL '7 days') AS scans_week,
      (SELECT COUNT(*)::int FROM scan_logs WHERE alert_type = 'sos') AS sos_count,
      (SELECT COUNT(*)::int FROM scan_logs WHERE read_at IS NULL) AS unread_scans,
      (SELECT COUNT(*)::int FROM api_request_logs WHERE created_at >= NOW() - INTERVAL '24 hours') AS api_requests_24h,
      (SELECT COUNT(*)::int FROM api_request_logs WHERE created_at >= NOW() - INTERVAL '24 hours' AND status_code >= 400) AS api_errors_24h,
      (SELECT COUNT(*)::int FROM security_audit_logs WHERE created_at >= NOW() - INTERVAL '24 hours') AS security_events_24h,
      (SELECT COUNT(*)::int FROM push_subscriptions) AS push_subscriptions
  `;
  const r = rows[0] as Record<string, number>;
  return {
    totalUsers: r.total_users,
    totalProfiles: r.total_profiles,
    activeProfiles: r.active_profiles,
    totalScans: r.total_scans,
    scansToday: r.scans_today,
    scansWeek: r.scans_week,
    sosCount: r.sos_count,
    unreadScans: r.unread_scans,
    apiRequests24h: r.api_requests_24h,
    apiErrors24h: r.api_errors_24h,
    securityEvents24h: r.security_events_24h,
    pushSubscriptions: r.push_subscriptions,
  };
}

export type AdminTimeSeriesPoint = { bucket: string; count: number };

export async function getAdminScanTimeSeries(
  days = 14,
): Promise<AdminTimeSeriesPoint[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      to_char(date_trunc('day', scanned_at), 'YYYY-MM-DD') AS bucket,
      COUNT(*)::int AS count
    FROM scan_logs
    WHERE scanned_at >= NOW() - ${`${days} days`}::interval
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows as AdminTimeSeriesPoint[];
}

export async function getAdminApiTimeSeries(
  hours = 24,
): Promise<AdminTimeSeriesPoint[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      to_char(date_trunc('hour', created_at), 'HH24:00') AS bucket,
      COUNT(*)::int AS count
    FROM api_request_logs
    WHERE created_at >= NOW() - ${`${hours} hours`}::interval
    GROUP BY date_trunc('hour', created_at), 1
    ORDER BY date_trunc('hour', created_at) ASC
  `;
  return rows as AdminTimeSeriesPoint[];
}

export type AdminUserRow = User & {
  profile_count: number;
  scan_count: number;
  is_admin: boolean;
  plan_tier?: string;
  max_profiles?: number | null;
};

export async function listAdminUsers(limit = 100, offset = 0): Promise<AdminUserRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.email, u.full_name, u.is_admin, u.created_at, u.updated_at,
      COUNT(DISTINCT qp.id)::int AS profile_count,
      COUNT(DISTINCT sl.id)::int AS scan_count
    FROM users u
    LEFT JOIN qr_profiles qp ON qp.tutor_id = u.id
    LEFT JOIN scan_logs sl ON sl.profile_id = qp.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AdminUserRow[];
}

export type AdminProfileRow = QrProfile & {
  tutor_email: string;
  scan_count: number;
};

export async function listAdminProfiles(
  limit = 100,
  offset = 0,
): Promise<AdminProfileRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      qp.id, qp.tutor_id, qp.slug, qp.profile_type, qp.beneficiary_name,
      qp.emergency_contact_name, qp.emergency_contact_phone,
      qp.secondary_contact_name, qp.secondary_contact_phone,
      qp.instructions, qp.medical_notes, qp.allergies, qp.blood_type,
      qp.clinical_pdf_filename, qp.clinical_pdf_uploaded_at,
      qp.is_active, qp.created_at,
      u.email AS tutor_email,
      COUNT(sl.id)::int AS scan_count
    FROM qr_profiles qp
    JOIN users u ON u.id = qp.tutor_id
    LEFT JOIN scan_logs sl ON sl.profile_id = qp.id
    GROUP BY qp.id, u.email
    ORDER BY qp.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AdminProfileRow[];
}

export type AdminScanRow = ScanLogWithProfile & { tutor_email: string };

export async function listAdminScanLogs(
  limit = 100,
  offset = 0,
): Promise<AdminScanRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.slug, u.email AS tutor_email
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    JOIN users u ON u.id = qp.tutor_id
    ORDER BY sl.scanned_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as AdminScanRow[];
}

export type ApiRequestLogRow = {
  id: string;
  path: string;
  method: string;
  status_code: number;
  duration_ms: number;
  ip_hash: string | null;
  user_id: string | null;
  error_message: string | null;
  created_at: string;
};

export async function listApiRequestLogs(
  limit = 100,
  offset = 0,
  errorsOnly = false,
): Promise<ApiRequestLogRow[]> {
  const sql = getSql();
  const rows = errorsOnly
    ? await sql`
        SELECT * FROM api_request_logs
        WHERE status_code >= 400
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    : await sql`
        SELECT * FROM api_request_logs
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
  return rows as ApiRequestLogRow[];
}

export type SecurityAuditRow = {
  id: string;
  event_type: string;
  ip_hash: string | null;
  user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function listSecurityAuditLogs(
  limit = 100,
  offset = 0,
): Promise<SecurityAuditRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, event_type, ip_hash, user_id, details, created_at
    FROM security_audit_logs
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as SecurityAuditRow[];
}

export type AdminTopEndpoint = { path: string; count: number; error_count: number };

export async function getAdminTopEndpoints(limit = 10): Promise<AdminTopEndpoint[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      path,
      COUNT(*)::int AS count,
      COUNT(*) FILTER (WHERE status_code >= 400)::int AS error_count
    FROM api_request_logs
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY path
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return rows as AdminTopEndpoint[];
}

export type AdminStatusBreakdown = { status_code: number; count: number };

export async function getAdminStatusBreakdown(): Promise<AdminStatusBreakdown[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT status_code, COUNT(*)::int AS count
    FROM api_request_logs
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY status_code
    ORDER BY status_code ASC
  `;
  return rows as AdminStatusBreakdown[];
}

export async function findUserPlanById(
  userId: string,
): Promise<{ plan_tier: string; max_profiles: number | null } | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT plan_tier, max_profiles
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return (
    (rows[0] as { plan_tier: string; max_profiles: number | null } | undefined) ??
    null
  );
}

export async function countQrProfilesByTutor(userId: string): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM qr_profiles WHERE tutor_id = ${userId}
  `;
  return (rows[0] as { count: number }).count ?? 0;
}

export async function countActiveQrProfilesByTutor(userId: string): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM qr_profiles
    WHERE tutor_id = ${userId} AND is_active = TRUE
  `;
  return (rows[0] as { count: number }).count ?? 0;
}

export async function findAdminUserById(
  userId: string,
): Promise<(AdminUserRow & { google_id: string | null }) | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      u.id, u.email, u.full_name, u.is_admin, u.google_id, u.plan_tier, u.max_profiles,
      u.created_at, u.updated_at,
      COUNT(DISTINCT qp.id)::int AS profile_count,
      COUNT(DISTINCT sl.id)::int AS scan_count
    FROM users u
    LEFT JOIN qr_profiles qp ON qp.tutor_id = u.id
    LEFT JOIN scan_logs sl ON sl.profile_id = qp.id
    WHERE u.id = ${userId}
    GROUP BY u.id
    LIMIT 1
  `;
  return (rows[0] as (AdminUserRow & { google_id: string | null }) | undefined) ?? null;
}

export async function adminUpdateUser(
  userId: string,
  data: {
    full_name?: string;
    is_admin?: boolean;
    plan_tier?: string;
    max_profiles?: number | null;
  },
): Promise<User | null> {
  const sql = getSql();
  const existing = await findAdminUserById(userId);
  if (!existing) return null;

  const rows = await sql`
    UPDATE users
    SET
      full_name = ${data.full_name !== undefined ? data.full_name : existing.full_name},
      is_admin = ${data.is_admin !== undefined ? data.is_admin : existing.is_admin},
      plan_tier = ${data.plan_tier !== undefined ? data.plan_tier : existing.plan_tier ?? "free"},
      max_profiles = ${data.max_profiles !== undefined ? data.max_profiles : existing.max_profiles ?? null}
    WHERE id = ${userId}
    RETURNING id, email, full_name, is_admin, updated_at, created_at
  `;
  return (rows[0] as User | undefined) ?? null;
}

export async function listQrProfilesByTutorAdmin(
  tutorId: string,
): Promise<QrProfile[]> {
  return listQrProfilesByTutor(tutorId);
}

export async function findAdminProfileById(
  profileId: string,
): Promise<AdminProfileRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      qp.id, qp.tutor_id, qp.slug, qp.profile_type, qp.beneficiary_name,
      qp.emergency_contact_name, qp.emergency_contact_phone,
      qp.secondary_contact_name, qp.secondary_contact_phone,
      qp.instructions, qp.medical_notes, qp.allergies, qp.blood_type,
      qp.clinical_pdf_filename, qp.clinical_pdf_uploaded_at,
      qp.is_active, qp.created_at,
      u.email AS tutor_email,
      COUNT(sl.id)::int AS scan_count
    FROM qr_profiles qp
    JOIN users u ON u.id = qp.tutor_id
    LEFT JOIN scan_logs sl ON sl.profile_id = qp.id
    WHERE qp.id = ${profileId}
    GROUP BY qp.id, u.email
    LIMIT 1
  `;
  return (rows[0] as AdminProfileRow | undefined) ?? null;
}

export async function adminUpdateQrProfile(
  profileId: string,
  data: Partial<
    Pick<
      QrProfile,
      | "beneficiary_name"
      | "profile_type"
      | "emergency_contact_name"
      | "emergency_contact_phone"
      | "secondary_contact_name"
      | "secondary_contact_phone"
      | "instructions"
      | "medical_notes"
      | "allergies"
      | "blood_type"
      | "is_active"
    >
  >,
): Promise<QrProfile | null> {
  const existing = await findQrProfileById(profileId);
  if (!existing) return null;
  return updateQrProfile(profileId, existing.tutor_id, data);
}

export async function adminDeleteQrProfile(profileId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM qr_profiles WHERE id = ${profileId} RETURNING id
  `;
  return rows.length > 0;
}

export type AdminScanDetail = AdminScanRow & {
  profile_id: string;
  user_agent: string | null;
  scanner_note: string | null;
  messages: ScanMessage[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  tutor_id: string;
  push_subscription_count: number;
};

export async function findAdminScanLogById(
  scanLogId: string,
): Promise<AdminScanDetail | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      sl.*,
      qp.beneficiary_name,
      qp.slug,
      qp.tutor_id,
      qp.emergency_contact_name,
      qp.emergency_contact_phone,
      u.email AS tutor_email,
      (SELECT COUNT(*)::int FROM push_subscriptions ps WHERE ps.user_id = qp.tutor_id) AS push_subscription_count
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    JOIN users u ON u.id = qp.tutor_id
    WHERE sl.id = ${scanLogId}
    LIMIT 1
  `;
  const row = rows[0] as
    | (AdminScanRow & {
        tutor_id: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        push_subscription_count: number;
      })
    | undefined;
  if (!row) return null;

  const messages = await listScanMessages(scanLogId);
  return { ...row, messages };
}

export async function adminSetScanLogRead(
  scanLogId: string,
  read: boolean,
): Promise<boolean> {
  const sql = getSql();
  const rows = read
    ? await sql`
        UPDATE scan_logs SET read_at = NOW() WHERE id = ${scanLogId} RETURNING id
      `
    : await sql`
        UPDATE scan_logs SET read_at = NULL WHERE id = ${scanLogId} RETURNING id
      `;
  return rows.length > 0;
}

export async function countPushSubscriptionsForUser(
  userId: string,
): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM push_subscriptions WHERE user_id = ${userId}
  `;
  return (rows[0] as { count: number }).count;
}

