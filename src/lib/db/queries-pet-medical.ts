import type {
  PetPreventiveItem,
  PetVisitAttachmentMeta,
  PetVetVisit,
  PreventiveKind,
  VetAccessToken,
  VisitTag,
} from "@/types/database";
import { getSql } from "@/lib/db/index";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ATTACHMENT_BYTES = 3 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_VISIT = 3;
const ALLOWED_ATTACHMENT_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

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

export type VisitAttachmentInput = {
  filename: string;
  mime: string;
  base64Data: string;
};

function sanitizeBase64(input: string): string {
  const commaIdx = input.indexOf(",");
  const withoutPrefix =
    input.startsWith("data:") && commaIdx >= 0
      ? input.slice(commaIdx + 1)
      : input;
  return withoutPrefix.replace(/[^A-Za-z0-9+/=]/g, "");
}

function assertValidAttachment(file: VisitAttachmentInput): string {
  const mime = file.mime.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!ALLOWED_ATTACHMENT_MIMES.has(mime)) {
    throw new Error("Archivo no permitido (JPEG, PNG, WebP, GIF o PDF)");
  }
  const clean = sanitizeBase64(file.base64Data);
  const bytes = Buffer.from(clean, "base64").byteLength;
  if (bytes <= 0) throw new Error("Archivo vacío");
  if (bytes > MAX_ATTACHMENT_BYTES) {
    throw new Error("Cada archivo puede pesar hasta 3 MB");
  }
  return clean;
}

function mapAttachments(raw: unknown): PetVisitAttachmentMeta[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      return mapAttachments(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      id: String(a.id),
      filename: String(a.filename ?? "archivo"),
      mime: String(a.mime ?? "application/octet-stream"),
    }));
}

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
    attachments: mapAttachments(row.attachments),
  };
}

function mapPreventive(row: Record<string, unknown>): PetPreventiveItem {
  return {
    id: String(row.id),
    pet_id: String(row.pet_id),
    kind: row.kind as PreventiveKind,
    name: String(row.name),
    last_applied_at: row.last_applied_at
      ? String(row.last_applied_at)
      : null,
    next_due_at: row.next_due_at ? String(row.next_due_at) : null,
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
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

async function assertPetOwnedByTutor(
  petId: string,
  tutorId: string,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT id FROM qr_profiles
    WHERE id = ${petId}
      AND tutor_id = ${tutorId}
      AND profile_type = 'pet'
    LIMIT 1
  `;
  return Boolean(rows[0]);
}

export async function listPetVetVisits(petId: string): Promise<PetVetVisit[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      v.id, v.pet_id, v.visit_date::text AS visit_date,
      v.summary, v.indications, v.tags, v.verified_by_vet,
      v.vet_name, v.vet_license, v.created_at,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', a.id,
              'filename', a.filename,
              'mime', a.mime
            )
            ORDER BY a.created_at ASC
          )
          FROM pet_vet_visit_attachments a
          WHERE a.visit_id = v.id
        ),
        '[]'::json
      ) AS attachments
    FROM pet_vet_visits v
    WHERE v.pet_id = ${petId}
    ORDER BY v.visit_date DESC, v.created_at DESC
  `;
  return (rows as Record<string, unknown>[]).map(mapVisit);
}

export async function listPetVetVisitsForTutor(
  petId: string,
  tutorId: string,
): Promise<PetVetVisit[] | null> {
  if (!(await assertPetOwnedByTutor(petId, tutorId))) return null;
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
  attachments?: VisitAttachmentInput[];
};

async function insertVisitAttachments(
  visitId: string,
  attachments: VisitAttachmentInput[] | undefined,
): Promise<PetVisitAttachmentMeta[]> {
  if (!attachments?.length) return [];
  if (attachments.length > MAX_ATTACHMENTS_PER_VISIT) {
    throw new Error(`Máximo ${MAX_ATTACHMENTS_PER_VISIT} archivos por visita`);
  }

  const sql = getSql();
  const saved: PetVisitAttachmentMeta[] = [];

  for (const file of attachments) {
    const clean = assertValidAttachment(file);
    const mime = file.mime.toLowerCase().split(";")[0]?.trim() ?? file.mime;
    const filename = (file.filename.trim() || "archivo").slice(0, 255);
    const rows = await sql`
      INSERT INTO pet_vet_visit_attachments (visit_id, filename, mime, file_data)
      VALUES (
        ${visitId},
        ${filename},
        ${mime},
        decode(${clean}, 'base64')
      )
      RETURNING id, filename, mime
    `;
    const row = rows[0] as PetVisitAttachmentMeta | undefined;
    if (row) saved.push(row);
  }

  return saved;
}

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
  if (!row) return null;

  const visit = mapVisit(row);
  visit.attachments = await insertVisitAttachments(
    visit.id,
    data.attachments,
  );
  return visit;
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

  const visit = mapVisit(row);
  visit.attachments = await insertVisitAttachments(
    visit.id,
    data.attachments,
  );

  return {
    visit,
    tutor_id: row.tutor_id,
    pet_name: row.pet_name,
  };
}

export async function listPreventiveItems(
  petId: string,
): Promise<PetPreventiveItem[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, pet_id, kind, name,
      last_applied_at::text AS last_applied_at,
      next_due_at::text AS next_due_at,
      notes, created_at, updated_at
    FROM pet_preventive_items
    WHERE pet_id = ${petId}
    ORDER BY
      kind ASC,
      next_due_at ASC NULLS LAST,
      name ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapPreventive);
}

export async function listPreventiveItemsForTutor(
  petId: string,
  tutorId: string,
): Promise<PetPreventiveItem[] | null> {
  if (!(await assertPetOwnedByTutor(petId, tutorId))) return null;
  return listPreventiveItems(petId);
}

export async function insertPreventiveItemForTutor(
  petId: string,
  tutorId: string,
  data: {
    kind: PreventiveKind;
    name: string;
    last_applied_at?: string | null;
    next_due_at?: string | null;
    notes?: string;
  },
): Promise<PetPreventiveItem | null> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO pet_preventive_items (
      pet_id, kind, name, last_applied_at, next_due_at, notes
    )
    SELECT
      p.id,
      ${data.kind},
      ${data.name.trim()},
      ${data.last_applied_at || null}::date,
      ${data.next_due_at || null}::date,
      ${data.notes?.trim() || ""}
    FROM qr_profiles p
    WHERE p.id = ${petId}
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
    RETURNING
      id, pet_id, kind, name,
      last_applied_at::text AS last_applied_at,
      next_due_at::text AS next_due_at,
      notes, created_at, updated_at
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPreventive(row) : null;
}

export async function updatePreventiveItemForTutor(
  petId: string,
  tutorId: string,
  itemId: string,
  data: {
    name: string;
    last_applied_at: string | null;
    next_due_at: string | null;
    notes: string;
  },
): Promise<PetPreventiveItem | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE pet_preventive_items i
    SET
      name = ${data.name.trim()},
      last_applied_at = ${data.last_applied_at || null}::date,
      next_due_at = ${data.next_due_at || null}::date,
      notes = ${data.notes.trim()}
    FROM qr_profiles p
    WHERE i.id = ${itemId}
      AND i.pet_id = ${petId}
      AND p.id = i.pet_id
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
    RETURNING
      i.id, i.pet_id, i.kind, i.name,
      i.last_applied_at::text AS last_applied_at,
      i.next_due_at::text AS next_due_at,
      i.notes, i.created_at, i.updated_at
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPreventive(row) : null;
}

export async function deletePreventiveItemForTutor(
  petId: string,
  tutorId: string,
  itemId: string,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM pet_preventive_items i
    USING qr_profiles p
    WHERE i.id = ${itemId}
      AND i.pet_id = ${petId}
      AND p.id = i.pet_id
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
    RETURNING i.id
  `;
  return Boolean(rows[0]);
}

export async function insertPreventiveItemByVet(
  token: string,
  data: {
    kind: PreventiveKind;
    name: string;
    last_applied_at?: string | null;
    next_due_at?: string | null;
    notes?: string;
  },
): Promise<PetPreventiveItem | null> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO pet_preventive_items (
      pet_id, kind, name, last_applied_at, next_due_at, notes
    )
    SELECT
      t.pet_id,
      ${data.kind},
      ${data.name.trim()},
      ${data.last_applied_at || null}::date,
      ${data.next_due_at || null}::date,
      ${data.notes?.trim() || ""}
    FROM vet_access_tokens t
    INNER JOIN qr_profiles p ON p.id = t.pet_id
    WHERE t.token = ${token}::uuid
      AND t.expires_at > NOW()
      AND p.profile_type = 'pet'
      AND p.is_active = TRUE
    RETURNING
      id, pet_id, kind, name,
      last_applied_at::text AS last_applied_at,
      next_due_at::text AS next_due_at,
      notes, created_at, updated_at
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPreventive(row) : null;
}

export async function getVisitAttachmentForTutor(
  petId: string,
  tutorId: string,
  attachmentId: string,
): Promise<{
  filename: string;
  mime: string;
  data_b64: string;
} | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      a.filename,
      a.mime,
      encode(a.file_data, 'base64') AS data_b64
    FROM pet_vet_visit_attachments a
    INNER JOIN pet_vet_visits v ON v.id = a.visit_id
    INNER JOIN qr_profiles p ON p.id = v.pet_id
    WHERE a.id = ${attachmentId}
      AND v.pet_id = ${petId}
      AND p.tutor_id = ${tutorId}
      AND p.profile_type = 'pet'
    LIMIT 1
  `;
  return (
    (rows[0] as
      | { filename: string; mime: string; data_b64: string }
      | undefined) ?? null
  );
}

export async function getVisitAttachmentByVetToken(
  token: string,
  attachmentId: string,
): Promise<{
  filename: string;
  mime: string;
  data_b64: string;
} | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      a.filename,
      a.mime,
      encode(a.file_data, 'base64') AS data_b64
    FROM pet_vet_visit_attachments a
    INNER JOIN pet_vet_visits v ON v.id = a.visit_id
    INNER JOIN vet_access_tokens t ON t.pet_id = v.pet_id
    INNER JOIN qr_profiles p ON p.id = v.pet_id
    WHERE a.id = ${attachmentId}
      AND t.token = ${token}::uuid
      AND t.expires_at > NOW()
      AND p.profile_type = 'pet'
      AND p.is_active = TRUE
    LIMIT 1
  `;
  return (
    (rows[0] as
      | { filename: string; mime: string; data_b64: string }
      | undefined) ?? null
  );
}
