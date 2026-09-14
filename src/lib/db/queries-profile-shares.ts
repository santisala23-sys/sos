import type {
  ProfileShare,
  ProfileShareWithUser,
  QrProfile,
  ScanLogWithProfile,
  SharedProfileEntry,
} from "@/types/database";
import { getSql } from "@/lib/db/index";
import { ensureDeferredMigrations } from "@/lib/db/ensure-schema";
import type { ProfileSharePermissionsInput } from "@/lib/profile-access";

const PROFILE_SHARE_SELECT = `
  ps.id,
  ps.profile_id,
  ps.owner_user_id,
  ps.shared_with_user_id,
  ps.can_receive_alerts,
  ps.can_view_profile,
  ps.can_edit_profile,
  ps.can_view_health_book,
  ps.can_save_location,
  ps.expires_at,
  ps.revoked_at,
  ps.created_at,
  ps.updated_at
`;

const QR_PROFILE_SELECT = `
  qp.id, qp.tutor_id, qp.slug, qp.profile_type, qp.beneficiary_name,
  qp.emergency_contact_name, qp.emergency_contact_phone,
  qp.secondary_contact_name, qp.secondary_contact_phone,
  qp.instructions, qp.medical_notes, qp.allergies, qp.blood_type, qp.health_insurance,
  qp.pet_breed, qp.pet_birth_date::text AS pet_birth_date,
  qp.clinical_pdf_filename, qp.clinical_pdf_uploaded_at,
  qp.saved_latitude, qp.saved_longitude, qp.saved_location_at,
  qp.sensitive_data_consent_at, qp.sensitive_data_consent_version,
  qp.is_active, qp.created_at,
  CASE WHEN qp.avatar_data IS NOT NULL THEN encode(qp.avatar_data, 'base64') ELSE NULL END AS avatar_b64,
  qp.avatar_mime
`;

function mapShare(row: Record<string, unknown>): ProfileShare {
  return row as unknown as ProfileShare;
}

export async function getProfileAccessForUser(
  profileId: string,
  userId: string,
): Promise<
  | { kind: "owner"; profile: QrProfile }
  | { kind: "shared"; profile: QrProfile; share: ProfileShare }
  | null
> {
  await ensureDeferredMigrations();
  const sql = getSql();

  const ownerRows = await sql`
    SELECT ${sql.unsafe(QR_PROFILE_SELECT)}
    FROM qr_profiles qp
    WHERE qp.id = ${profileId} AND qp.tutor_id = ${userId}
    LIMIT 1
  `;

  if (ownerRows[0]) {
    return { kind: "owner", profile: ownerRows[0] as unknown as QrProfile };
  }

  const shareRows = await sql`
    SELECT
      ${sql.unsafe(PROFILE_SHARE_SELECT)},
      ${sql.unsafe(QR_PROFILE_SELECT)}
    FROM profile_shares ps
    JOIN qr_profiles qp ON qp.id = ps.profile_id
    WHERE ps.profile_id = ${profileId}
      AND ps.shared_with_user_id = ${userId}
      AND ps.revoked_at IS NULL
      AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
    LIMIT 1
  `;

  const row = shareRows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  const share = mapShare(row);
  const profile = row as unknown as QrProfile;
  return { kind: "shared", profile, share };
}

export async function listAllProfileSharesForOwnerUser(
  ownerUserId: string,
): Promise<ProfileShareWithUser[]> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT
      ps.id,
      ps.profile_id,
      ps.owner_user_id,
      ps.shared_with_user_id,
      ps.can_receive_alerts,
      ps.can_view_profile,
      ps.can_edit_profile,
      ps.can_view_health_book,
      ps.can_save_location,
      ps.expires_at,
      ps.revoked_at,
      ps.created_at,
      ps.updated_at,
      u.email AS shared_with_email,
      u.full_name AS shared_with_name
    FROM profile_shares ps
    JOIN users u ON u.id = ps.shared_with_user_id
    JOIN qr_profiles qp ON qp.id = ps.profile_id
    WHERE qp.tutor_id = ${ownerUserId}
      AND ps.revoked_at IS NULL
      AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
    ORDER BY ps.created_at ASC
  `;
  return rows as ProfileShareWithUser[];
}

export async function listProfileSharesForOwner(
  profileId: string,
  ownerUserId: string,
): Promise<ProfileShareWithUser[]> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT
      ps.id,
      ps.profile_id,
      ps.owner_user_id,
      ps.shared_with_user_id,
      ps.can_receive_alerts,
      ps.can_view_profile,
      ps.can_edit_profile,
      ps.can_view_health_book,
      ps.can_save_location,
      ps.expires_at,
      ps.revoked_at,
      ps.created_at,
      ps.updated_at,
      u.email AS shared_with_email,
      u.full_name AS shared_with_name
    FROM profile_shares ps
    JOIN users u ON u.id = ps.shared_with_user_id
    JOIN qr_profiles qp ON qp.id = ps.profile_id
    WHERE ps.profile_id = ${profileId}
      AND qp.tutor_id = ${ownerUserId}
      AND ps.revoked_at IS NULL
      AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
    ORDER BY ps.created_at ASC
  `;
  return rows as ProfileShareWithUser[];
}

export async function countActiveProfileShares(profileId: string): Promise<number> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM profile_shares
    WHERE profile_id = ${profileId}
      AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
  `;
  return (rows[0] as { count: number }).count;
}

export async function listAlertRecipientUserIds(profileId: string): Promise<string[]> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT qp.tutor_id AS user_id
    FROM qr_profiles qp
    WHERE qp.id = ${profileId}
    UNION
    SELECT ps.shared_with_user_id AS user_id
    FROM profile_shares ps
    WHERE ps.profile_id = ${profileId}
      AND ps.revoked_at IS NULL
      AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
      AND ps.can_receive_alerts = TRUE
  `;
  return (rows as { user_id: string }[]).map((row) => row.user_id);
}

export async function listSharedProfilesForUser(userId: string): Promise<SharedProfileEntry[]> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT
      ${sql.unsafe(QR_PROFILE_SELECT)},
      ps.id AS share_id,
      ps.profile_id AS share_profile_id,
      ps.owner_user_id,
      ps.shared_with_user_id,
      ps.can_receive_alerts,
      ps.can_view_profile,
      ps.can_edit_profile,
      ps.can_view_health_book,
      ps.can_save_location,
      ps.expires_at,
      ps.revoked_at,
      ps.created_at AS share_created_at,
      ps.updated_at AS share_updated_at,
      owner.email AS owner_email,
      owner.full_name AS owner_name
    FROM profile_shares ps
    JOIN qr_profiles qp ON qp.id = ps.profile_id
    JOIN users owner ON owner.id = ps.owner_user_id
    WHERE ps.shared_with_user_id = ${userId}
      AND ps.revoked_at IS NULL
      AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
    ORDER BY ps.created_at DESC
  `;

  return (rows as Record<string, unknown>[]).map((row) => {
    const profile = row as unknown as QrProfile;
    const share: ProfileShare = {
      id: row.share_id as string,
      profile_id: row.share_profile_id as string,
      owner_user_id: row.owner_user_id as string,
      shared_with_user_id: row.shared_with_user_id as string,
      can_receive_alerts: row.can_receive_alerts as boolean,
      can_view_profile: row.can_view_profile as boolean,
      can_edit_profile: row.can_edit_profile as boolean,
      can_view_health_book: row.can_view_health_book as boolean,
      can_save_location: row.can_save_location as boolean,
      expires_at: (row.expires_at as string | null) ?? null,
      revoked_at: (row.revoked_at as string | null) ?? null,
      created_at: row.share_created_at as string,
      updated_at: row.share_updated_at as string,
    };
    return {
      ...profile,
      share,
      owner_email: row.owner_email as string,
      owner_name: (row.owner_name as string | null) ?? null,
    };
  });
}

export async function upsertProfileShare(params: {
  profileId: string;
  ownerUserId: string;
  sharedWithUserId: string;
  permissions: ProfileSharePermissionsInput;
  expiresAt: string | null;
}): Promise<ProfileShare | null> {
  await ensureDeferredMigrations();
  const sql = getSql();

  const profileRows = await sql`
    SELECT id FROM qr_profiles
    WHERE id = ${params.profileId} AND tutor_id = ${params.ownerUserId}
    LIMIT 1
  `;
  if (!profileRows[0]) return null;

  const rows = await sql`
    INSERT INTO profile_shares (
      profile_id,
      owner_user_id,
      shared_with_user_id,
      can_receive_alerts,
      can_view_profile,
      can_edit_profile,
      can_view_health_book,
      can_save_location,
      expires_at,
      revoked_at,
      updated_at
    ) VALUES (
      ${params.profileId},
      ${params.ownerUserId},
      ${params.sharedWithUserId},
      ${params.permissions.can_receive_alerts},
      ${params.permissions.can_view_profile},
      ${params.permissions.can_edit_profile},
      ${params.permissions.can_view_health_book},
      ${params.permissions.can_save_location},
      ${params.expiresAt},
      NULL,
      NOW()
    )
    ON CONFLICT (profile_id, shared_with_user_id)
    DO UPDATE SET
      can_receive_alerts = EXCLUDED.can_receive_alerts,
      can_view_profile = EXCLUDED.can_view_profile,
      can_edit_profile = EXCLUDED.can_edit_profile,
      can_view_health_book = EXCLUDED.can_view_health_book,
      can_save_location = EXCLUDED.can_save_location,
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL,
      updated_at = NOW()
    RETURNING
      id, profile_id, owner_user_id, shared_with_user_id,
      can_receive_alerts, can_view_profile, can_edit_profile,
      can_view_health_book, can_save_location,
      expires_at, revoked_at, created_at, updated_at
  `;
  return (rows[0] as ProfileShare | undefined) ?? null;
}

export async function updateProfileShare(params: {
  shareId: string;
  ownerUserId: string;
  permissions: ProfileSharePermissionsInput;
  expiresAt: string | null;
}): Promise<ProfileShare | null> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    UPDATE profile_shares ps
    SET
      can_receive_alerts = ${params.permissions.can_receive_alerts},
      can_view_profile = ${params.permissions.can_view_profile},
      can_edit_profile = ${params.permissions.can_edit_profile},
      can_view_health_book = ${params.permissions.can_view_health_book},
      can_save_location = ${params.permissions.can_save_location},
      expires_at = ${params.expiresAt},
      updated_at = NOW()
    FROM qr_profiles qp
    WHERE ps.id = ${params.shareId}
      AND ps.profile_id = qp.id
      AND qp.tutor_id = ${params.ownerUserId}
      AND ps.revoked_at IS NULL
    RETURNING
      ps.id, ps.profile_id, ps.owner_user_id, ps.shared_with_user_id,
      ps.can_receive_alerts, ps.can_view_profile, ps.can_edit_profile,
      ps.can_view_health_book, ps.can_save_location,
      ps.expires_at, ps.revoked_at, ps.created_at, ps.updated_at
  `;
  return (rows[0] as ProfileShare | undefined) ?? null;
}

export async function listScanLogsForUser(
  userId: string,
  limit = 50,
): Promise<ScanLogWithProfile[]> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.slug
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE qp.tutor_id = ${userId}
       OR EXISTS (
         SELECT 1 FROM profile_shares ps
         WHERE ps.profile_id = qp.id
           AND ps.shared_with_user_id = ${userId}
           AND ps.revoked_at IS NULL
           AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
           AND (ps.can_receive_alerts OR ps.can_view_profile OR ps.can_edit_profile)
       )
    ORDER BY sl.scanned_at DESC
    LIMIT ${limit}
  `;
  return rows as ScanLogWithProfile[];
}

export async function countUnreadScanLogsForUser(userId: string): Promise<number> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.read_at IS NULL
      AND (
        qp.tutor_id = ${userId}
        OR EXISTS (
          SELECT 1 FROM profile_shares ps
          WHERE ps.profile_id = qp.id
            AND ps.shared_with_user_id = ${userId}
            AND ps.revoked_at IS NULL
            AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
            AND (ps.can_receive_alerts OR ps.can_view_profile OR ps.can_edit_profile)
        )
      )
  `;
  return (rows[0] as { count: number }).count;
}

export async function markAllScanLogsReadForUser(userId: string): Promise<number> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    UPDATE scan_logs sl
    SET read_at = NOW()
    FROM qr_profiles qp
    WHERE sl.profile_id = qp.id
      AND sl.read_at IS NULL
      AND (
        qp.tutor_id = ${userId}
        OR EXISTS (
          SELECT 1 FROM profile_shares ps
          WHERE ps.profile_id = qp.id
            AND ps.shared_with_user_id = ${userId}
            AND ps.revoked_at IS NULL
            AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
            AND (ps.can_receive_alerts OR ps.can_view_profile OR ps.can_edit_profile)
        )
      )
    RETURNING sl.id
  `;
  return rows.length;
}

export async function markScanLogReadForUser(
  scanLogId: string,
  userId: string,
): Promise<boolean> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    UPDATE scan_logs sl
    SET read_at = NOW()
    FROM qr_profiles qp
    WHERE sl.id = ${scanLogId}
      AND sl.profile_id = qp.id
      AND (
        qp.tutor_id = ${userId}
        OR EXISTS (
          SELECT 1 FROM profile_shares ps
          WHERE ps.profile_id = qp.id
            AND ps.shared_with_user_id = ${userId}
            AND ps.revoked_at IS NULL
            AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
            AND (ps.can_receive_alerts OR ps.can_view_profile OR ps.can_edit_profile)
        )
      )
    RETURNING sl.id
  `;
  return rows.length > 0;
}

export async function findScanLogForUser(
  scanLogId: string,
  userId: string,
): Promise<ScanLogWithProfile | null> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    SELECT sl.*, qp.beneficiary_name, qp.slug
    FROM scan_logs sl
    JOIN qr_profiles qp ON qp.id = sl.profile_id
    WHERE sl.id = ${scanLogId}
      AND (
        qp.tutor_id = ${userId}
        OR EXISTS (
          SELECT 1 FROM profile_shares ps
          WHERE ps.profile_id = qp.id
            AND ps.shared_with_user_id = ${userId}
            AND ps.revoked_at IS NULL
            AND (ps.expires_at IS NULL OR ps.expires_at > NOW())
            AND (ps.can_receive_alerts OR ps.can_view_profile OR ps.can_edit_profile)
        )
      )
    LIMIT 1
  `;
  return (rows[0] as ScanLogWithProfile | undefined) ?? null;
}

export async function revokeProfileShare(
  shareId: string,
  ownerUserId: string,
): Promise<boolean> {
  await ensureDeferredMigrations();
  const sql = getSql();
  const rows = await sql`
    UPDATE profile_shares ps
    SET revoked_at = NOW(), updated_at = NOW()
    FROM qr_profiles qp
    WHERE ps.id = ${shareId}
      AND ps.profile_id = qp.id
      AND qp.tutor_id = ${ownerUserId}
      AND ps.revoked_at IS NULL
    RETURNING ps.id
  `;
  return rows.length > 0;
}
