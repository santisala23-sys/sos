import { getSql } from "@/lib/db/index";

export type DeletionRequestRow = {
  id: string;
  email: string;
  full_name: string | null;
  deletion_requested_at: string;
  deletion_scheduled_for: string | null;
  deleted_at: string | null;
  created_at: string;
};

export async function listDeletionRequests(limit = 200): Promise<DeletionRequestRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, email, full_name,
      deletion_requested_at, deletion_scheduled_for, deleted_at,
      created_at
    FROM users
    WHERE deletion_requested_at IS NOT NULL
    ORDER BY deletion_requested_at DESC
    LIMIT ${limit}
  `;
  return rows as DeletionRequestRow[];
}

export async function cancelDeletionRequest(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE users
    SET deletion_requested_at = NULL,
        deletion_scheduled_for = NULL
    WHERE id = ${userId} AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

export async function anonymizeAccountNow(userId: string): Promise<boolean> {
  const sql = getSql();
  const updated = await sql`
    UPDATE users
    SET
      email = ${`deleted+${userId}@sosme.invalid`},
      password_hash = NULL,
      full_name = NULL,
      google_id = NULL,
      avatar_url = NULL,
      is_admin = FALSE,
      deleted_at = NOW()
    WHERE id = ${userId} AND deleted_at IS NULL
    RETURNING id
  `;
  if (updated.length === 0) return false;

  // Eliminar datos operativos.
  await sql`DELETE FROM qr_profiles WHERE tutor_id = ${userId}`;
  await sql`DELETE FROM push_subscriptions WHERE user_id = ${userId}`;
  return true;
}

export async function runRetentionPurge() {
  const sql = getSql();
  const apiDel = await sql`
    DELETE FROM api_request_logs
    WHERE created_at < NOW() - INTERVAL '90 days'
  `;
  const secDel = await sql`
    DELETE FROM security_audit_logs
    WHERE created_at < NOW() - INTERVAL '12 months'
  `;
  const scanMsgDel = await sql`
    DELETE FROM scan_messages sm
    USING scan_logs sl
    WHERE sm.scan_log_id = sl.id
      AND sl.scanned_at < NOW() - INTERVAL '24 months'
  `;
  const scanDel = await sql`
    DELETE FROM scan_logs
    WHERE scanned_at < NOW() - INTERVAL '24 months'
  `;

  return {
    api_request_logs: (apiDel as { rowCount?: number }).rowCount ?? 0,
    security_audit_logs: (secDel as { rowCount?: number }).rowCount ?? 0,
    scan_messages: (scanMsgDel as { rowCount?: number }).rowCount ?? 0,
    scan_logs: (scanDel as { rowCount?: number }).rowCount ?? 0,
  };
}

export async function processDueDeletionRequests(limit = 200) {
  const sql = getSql();
  const usersToAnonymize = await sql`
    SELECT id
    FROM users
    WHERE deletion_requested_at IS NOT NULL
      AND deleted_at IS NULL
      AND COALESCE(deletion_scheduled_for, deletion_requested_at) < NOW()
    ORDER BY deletion_requested_at ASC
    LIMIT ${limit}
  `;
  const ids = (usersToAnonymize as { id: string }[]).map((r) => r.id);
  let accounts_anonymized = 0;
  for (const id of ids) {
    const ok = await anonymizeAccountNow(id);
    if (ok) accounts_anonymized += 1;
  }
  return { accounts_anonymized };
}

