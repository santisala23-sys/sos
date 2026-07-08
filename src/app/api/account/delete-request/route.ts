import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withApi } from "@/lib/api/with-api";
import { getSession, clearSessionCookieOptions } from "@/lib/auth/session";
import { getSql } from "@/lib/db/index";

const DELETE_GRACE_DAYS = 30;

export const POST = withApi({ rateLimit: "auth" }, async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sql = getSql();

  const rows = await sql`
    UPDATE users
    SET
      deletion_requested_at = COALESCE(deletion_requested_at, NOW()),
      deletion_scheduled_for = COALESCE(
        deletion_scheduled_for,
        NOW() + ${`${DELETE_GRACE_DAYS} days`}::interval
      )
    WHERE id = ${session.userId} AND deleted_at IS NULL
    RETURNING deletion_requested_at, deletion_scheduled_for
  `;

  const row = rows[0] as
    | { deletion_requested_at: string; deletion_scheduled_for: string }
    | undefined;

  const cookieStore = await cookies();
  cookieStore.set(clearSessionCookieOptions());

  if (!row) {
    return NextResponse.json(
      { error: "No se pudo solicitar la baja" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    deletionRequestedAt: row.deletion_requested_at,
    deletionScheduledFor: row.deletion_scheduled_for,
  });
});

