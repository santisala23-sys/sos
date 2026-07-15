import type { PetVetVisit, VetAccessToken, VisitTag } from "@/types/database";
import { getSql } from "@/lib/db/index";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type VetViewPet = {
  id: string;
  tutor_id: string;
  beneficiary_name: string;
  slug: string;
  allergies: string | null;
  medical_notes: string | null;
  avatar_b64: string | null;
  avatar_mime: string | null;
};

function mapVisit(row: Record<string, unknown>): PetVetVisit {
  return {
    id: String(row.id),
    pet_id: String(row.pet_id),
    visit_date: String(row.visit_date),
    summary: String(row.summary),
    indications: String(row.indications ?? ""),
    tags: (row.tags as VisitTag[]) ?? [],
    verified_by_vet: Boolean(row.verified_by_vet),
    vet_name: (row.vet_name as string | null) ?? null,
    vet_license: (row.vet_license as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

export async function createVetAccessToken(
  petId: string,
  tutorId: string,
): Promise<VetAccessToken | null> {
  const sql = getSql();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

  const rows = await sql`
    INSERT INTO vet_access_tokens (pet_id, expires_at)
    SELECT p.id, ${expiresAt}::timestamptz
    FROM qr_profiles p
    WHERE p.id = ${petId}
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
      AND p.is_active = TRUE
    RETURNING id, pet_id, token::text AS token, expires_at, created_at
  `;

  return (rows[0] as VetAccessToken | undefined) ?? null;
}

export async function getPetByValidVetToken(
  token: string,
): Promise<VetViewPet | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      p.id,
      p.tutor_id,
      p.beneficiary_name,
      p.slug,
      p.allergies,
      p.medical_notes,
      CASE WHEN p.avatar_data IS NOT NULL THEN encode(p.avatar_data, 'base64') ELSE NULL END AS avatar_b64,
      p.avatar_mime
    FROM vet_access_tokens t
    INNER JOIN qr_profiles p ON p.id = t.pet_id
    WHERE t.token = ${token}::uuid
      AND t.expires_at > NOW()
      AND p.profile_type = 'pet'
      AND p.is_active = TRUE
    LIMIT 1
  `;
  return (rows[0] as VetViewPet | undefined) ?? null;
}

export async function listPetVetVisits(petId: string): Promise<PetVetVisit[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, pet_id, visit_date::text AS visit_date,
      summary, indications, tags, verified_by_vet,
      vet_name, vet_license, created_at
    FROM pet_vet_visits
    WHERE pet_id = ${petId}
    ORDER BY visit_date DESC, created_at DESC
  `;
  return (rows as Record<string, unknown>[]).map(mapVisit);
}

export async function listPetVetVisitsForTutor(
  petId: string,
  tutorId: string,
): Promise<PetVetVisit[] | null> {
  const sql = getSql();
  const owned = await sql`
    SELECT id FROM qr_profiles
    WHERE id = ${petId}
      AND tutor_id = ${tutorId}
      AND profile_type = 'pet'
    LIMIT 1
  `;
  if (!owned[0]) return null;
  return listPetVetVisits(petId);
}

export type VisitInsertInput = {
  visit_date: string;
  summary: string;
  indications?: string;
  tags?: VisitTag[];
  verified_by_vet: boolean;
  vet_name?: string | null;
  vet_license?: string | null;
};

export async function insertVisitByTutor(
  petId: string,
  tutorId: string,
  data: Omit<VisitInsertInput, "verified_by_vet">,
): Promise<PetVetVisit | null> {
  const sql = getSql();
  const tags = data.tags ?? [];
  const rows = await sql`
    INSERT INTO pet_vet_visits (
      pet_id, visit_date, summary, indications, tags,
      verified_by_vet, vet_name, vet_license
    )
    SELECT
      p.id,
      ${data.visit_date}::date,
      ${data.summary},
      ${data.indications?.trim() || ""},
      ${tags}::text[],
      FALSE,
      ${data.vet_name?.trim() || null},
      ${data.vet_license?.trim() || null}
    FROM qr_profiles p
    WHERE p.id = ${petId}
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
    RETURNING
      id, pet_id, visit_date::text AS visit_date,
      summary, indications, tags, verified_by_vet,
      vet_name, vet_license, created_at
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapVisit(row) : null;
}

export type VetVisitInsertResult = {
  visit: PetVetVisit;
  tutor_id: string;
  pet_name: string;
};

export async function insertVisitByVet(
  token: string,
  data: Omit<VisitInsertInput, "verified_by_vet"> & {
    vet_name: string;
    vet_license: string;
  },
): Promise<VetVisitInsertResult | null> {
  const sql = getSql();
  const tags = data.tags ?? [];
  const rows = await sql`
    WITH inserted AS (
      INSERT INTO pet_vet_visits (
        pet_id, visit_date, summary, indications, tags,
        verified_by_vet, vet_name, vet_license
      )
      SELECT
        t.pet_id,
        ${data.visit_date}::date,
        ${data.summary},
        ${data.indications?.trim() || ""},
        ${tags}::text[],
        TRUE,
        ${data.vet_name},
        ${data.vet_license}
      FROM vet_access_tokens t
      INNER JOIN qr_profiles p ON p.id = t.pet_id
      WHERE t.token = ${token}::uuid
        AND t.expires_at > NOW()
        AND p.profile_type = 'pet'
        AND p.is_active = TRUE
      RETURNING
        id, pet_id, visit_date::text AS visit_date,
        summary, indications, tags, verified_by_vet,
        vet_name, vet_license, created_at
    )
    SELECT
      i.*,
      p.tutor_id,
      p.beneficiary_name AS pet_name
    FROM inserted i
    INNER JOIN qr_profiles p ON p.id = i.pet_id
  `;

  const row = rows[0] as
    | (Record<string, unknown> & { tutor_id: string; pet_name: string })
    | undefined;
  if (!row) return null;

  return {
    visit: mapVisit(row),
    tutor_id: row.tutor_id,
    pet_name: row.pet_name,
  };
}
