import { getSql } from "@/lib/db/index";

export async function markAccountExported(userId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE users
    SET last_exported_at = NOW()
    WHERE id = ${userId}
  `;
}

