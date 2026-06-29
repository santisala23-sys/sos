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

type UserRow = User & { password_hash: string };

export async function findUserByEmail(
  email: string,
): Promise<UserRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, password_hash, full_name, updated_at, created_at
    FROM users
    WHERE email = ${email.toLowerCase()}
    LIMIT 1
  `;
  return (rows[0] as UserRow | undefined) ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  fullName: string,
): Promise<User> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (email, password_hash, full_name)
    VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName})
    RETURNING id, email, full_name, updated_at, created_at
  `;
  return rows[0] as User;
}

export async function listQrProfilesByTutor(tutorId: string): Promise<QrProfile[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
          instructions, medical_notes, allergies,
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
          instructions, medical_notes, allergies,
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
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
    is_active?: boolean;
  },
): Promise<QrProfile> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO qr_profiles (
      tutor_id, slug, profile_type, beneficiary_name, emergency_contact_name,
      emergency_contact_phone, secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies, is_active
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
      ${data.is_active ?? true}
    )
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
      | "is_active"
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
      is_active = ${data.is_active ?? existing.is_active}
    WHERE id = ${id} AND tutor_id = ${tutorId}
    RETURNING
      id, tutor_id, slug, profile_type, beneficiary_name,
      emergency_contact_name, emergency_contact_phone,
      secondary_contact_name, secondary_contact_phone,
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (
      ${userId},
      ${subscription.endpoint},
      ${subscription.keys.p256dh},
      ${subscription.keys.auth}
    )
    ON CONFLICT (endpoint) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          p256dh = EXCLUDED.p256dh,
          auth = EXCLUDED.auth
  `;
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
    SELECT * FROM scan_messages
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

export async function addScanMessage(
  scanLogId: string,
  sender: MessageSender,
  body: string,
): Promise<ScanMessage | null> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO scan_messages (scan_log_id, sender, body)
    VALUES (${scanLogId}, ${sender}, ${body.trim()})
    RETURNING *
  `;
  const message = rows[0] as ScanMessage | undefined;
  if (!message) return null;

  if (sender === "public") {
    await sql`
      UPDATE scan_logs
      SET
        scanner_note = ${body.trim()},
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
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
      instructions, medical_notes, allergies,
      clinical_pdf_filename, clinical_pdf_uploaded_at,
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
