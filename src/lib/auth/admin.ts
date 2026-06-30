import { getSql } from "@/lib/db/index";

function getBootstrapAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT is_admin, email FROM users WHERE id = ${userId} LIMIT 1
  `;
  const user = rows[0] as { is_admin: boolean; email: string } | undefined;
  if (!user) return false;
  if (user.is_admin) return true;

  const bootstrap = getBootstrapAdminEmails();
  if (bootstrap.has(user.email.toLowerCase())) {
    await sql`
      UPDATE users SET is_admin = TRUE WHERE id = ${userId} AND is_admin = FALSE
    `;
    return true;
  }

  return false;
}

export async function requireAdminUserId(userId: string): Promise<boolean> {
  return isUserAdmin(userId);
}

export function isAdminPanelEnabled(): boolean {
  return Boolean(process.env.ADMIN_EMAILS?.trim());
}
