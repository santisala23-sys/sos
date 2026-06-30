import { getSql } from "@/lib/db/index";

export type AuditEventType =
  | "login_failed"
  | "login_success"
  | "register"
  | "rate_limited"
  | "invalid_scan_token"
  | "admin_access"
  | "alert_spam_blocked"
  | "pdf_access_denied"
  | "push_hijack_blocked";

export async function logSecurityAudit(data: {
  eventType: AuditEventType;
  ipHash?: string | null;
  userId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO security_audit_logs (event_type, ip_hash, user_id, details)
      VALUES (
        ${data.eventType},
        ${data.ipHash ?? null},
        ${data.userId ?? null},
        ${data.details ? JSON.stringify(data.details) : null}
      )
    `;
  } catch (error) {
    console.error("[security-audit]", error);
  }
}

export async function logApiRequest(data: {
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  ipHash?: string | null;
  userId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO api_request_logs (
        path, method, status_code, duration_ms, ip_hash, user_id, error_message
      )
      VALUES (
        ${data.path},
        ${data.method},
        ${data.statusCode},
        ${data.durationMs},
        ${data.ipHash ?? null},
        ${data.userId ?? null},
        ${data.errorMessage ?? null}
      )
    `;
  } catch (error) {
    console.error("[api-log]", error);
  }
}
