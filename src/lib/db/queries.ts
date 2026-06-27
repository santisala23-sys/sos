import type { AlertType, QrProfile, ScanLog, User } from "@/types/database";
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
    SELECT *
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
        SELECT *
        FROM qr_profiles
        WHERE slug = ${slug} AND is_active = TRUE
        LIMIT 1
      `
    : await sql`
        SELECT *
        FROM qr_profiles
        WHERE slug = ${slug}
        LIMIT 1
      `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function findQrProfileById(id: string): Promise<QrProfile | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM qr_profiles WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function findActiveQrProfileById(
  id: string,
): Promise<QrProfile | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT *
    FROM qr_profiles
    WHERE id = ${id} AND is_active = TRUE
    LIMIT 1
  `;
  return (rows[0] as QrProfile | undefined) ?? null;
}

export async function createQrProfile(
  data: Omit<QrProfile, "id" | "created_at" | "is_active"> & {
    is_active?: boolean;
  },
): Promise<QrProfile> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO qr_profiles (
      tutor_id, slug, beneficiary_name, emergency_contact_name,
      emergency_contact_phone, instructions, medical_notes, is_active
    )
    VALUES (
      ${data.tutor_id},
      ${data.slug},
      ${data.beneficiary_name},
      ${data.emergency_contact_name},
      ${data.emergency_contact_phone},
      ${data.instructions},
      ${data.medical_notes ?? ""},
      ${data.is_active ?? true}
    )
    RETURNING *
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
      | "emergency_contact_name"
      | "emergency_contact_phone"
      | "instructions"
      | "medical_notes"
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
      emergency_contact_name = ${data.emergency_contact_name ?? existing.emergency_contact_name},
      emergency_contact_phone = ${data.emergency_contact_phone ?? existing.emergency_contact_phone},
      instructions = ${data.instructions ?? existing.instructions},
      medical_notes = ${data.medical_notes ?? existing.medical_notes ?? ""},
      is_active = ${data.is_active ?? existing.is_active}
    WHERE id = ${id} AND tutor_id = ${tutorId}
    RETURNING *
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
  return rows[0] as Pick<ScanLog, "id" | "scanned_at">;
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
    SET latitude = ${latitude}, longitude = ${longitude}
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
