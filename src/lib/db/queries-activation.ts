import { getSql } from "@/lib/db/index";
import {
  generateActivationCode,
  generateProductSlug,
  normalizeActivationCode,
} from "@/lib/activation/codes";
import type { QrProfile } from "@/types/database";
import type { ProfileType } from "@/lib/profile-types";
import { createQrProfile } from "@/lib/db/queries";

export type QrProductBatchRow = {
  id: string;
  partner_name: string;
  product_label: string | null;
  notes: string | null;
  quantity: number;
  created_at: string;
  unclaimed_count: number;
  claimed_count: number;
  disabled_count: number;
};

export type QrActivationRow = {
  id: string;
  batch_id: string | null;
  profile_id: string | null;
  activation_code: string;
  public_slug: string | null;
  status: "unclaimed" | "claimed" | "disabled";
  claimed_at: string | null;
  claimed_by_user_id: string | null;
  created_at: string;
  partner_name: string | null;
  product_label: string | null;
};

export type ActivationPublicView = {
  code: string;
  status: QrActivationRow["status"];
  partnerName: string | null;
  productLabel: string | null;
  publicSlug: string | null;
  profileId: string | null;
  claimedByCurrentUser: boolean;
};

export class ActivationError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "DISABLED" | "ALREADY_CLAIMED" | "RACE" | "INTERNAL",
  ) {
    super(message);
    this.name = "ActivationError";
  }
}

export async function findActivationByCode(
  rawCode: string,
): Promise<QrActivationRow | null> {
  const code = normalizeActivationCode(rawCode);
  if (!code) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT
      a.id, a.batch_id, a.profile_id, a.activation_code, a.public_slug,
      a.status, a.claimed_at, a.claimed_by_user_id, a.created_at,
      b.partner_name, b.product_label
    FROM qr_activations a
    LEFT JOIN qr_product_batches b ON b.id = a.batch_id
    WHERE a.activation_code = ${code}
    LIMIT 1
  `;
  return (rows[0] as QrActivationRow | undefined) ?? null;
}

export function toActivationPublicView(
  row: QrActivationRow,
  currentUserId?: string | null,
): ActivationPublicView {
  return {
    code: row.activation_code,
    status: row.status,
    partnerName: row.partner_name,
    productLabel: row.product_label,
    publicSlug: row.public_slug,
    profileId: row.profile_id,
    claimedByCurrentUser: Boolean(
      currentUserId && row.claimed_by_user_id === currentUserId,
    ),
  };
}

export async function claimActivationForUser(
  rawCode: string,
  userId: string,
  profileData: {
    beneficiary_name: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    instructions: string;
    profile_type?: ProfileType;
  },
): Promise<{ profile: QrProfile; activation: QrActivationRow }> {
  const code = normalizeActivationCode(rawCode);
  const activation = await findActivationByCode(code);

  if (!activation) {
    throw new ActivationError("Código no encontrado", "NOT_FOUND");
  }
  if (activation.status === "disabled") {
    throw new ActivationError("Este código fue deshabilitado", "DISABLED");
  }
  if (activation.status === "claimed") {
    if (activation.claimed_by_user_id === userId && activation.profile_id) {
      const sql = getSql();
      const rows = await sql`
        SELECT
          id, tutor_id, slug, profile_type, beneficiary_name,
          emergency_contact_name, emergency_contact_phone,
          secondary_contact_name, secondary_contact_phone,
          instructions, medical_notes, allergies, blood_type,
          clinical_pdf_filename, clinical_pdf_uploaded_at,
          sensitive_data_consent_at, sensitive_data_consent_version,
          is_active, created_at
        FROM qr_profiles
        WHERE id = ${activation.profile_id}
        LIMIT 1
      `;
      const profile = rows[0] as QrProfile | undefined;
      if (profile) {
        return { profile, activation };
      }
    }
    throw new ActivationError(
      activation.claimed_by_user_id === userId
        ? "Este código ya fue activado"
        : "Este código ya fue activado por otra cuenta",
      "ALREADY_CLAIMED",
    );
  }

  const slug = activation.public_slug ?? generateProductSlug(code);
  const profile = await createQrProfile({
    tutor_id: userId,
    slug,
    profile_type: profileData.profile_type ?? "person",
    beneficiary_name: profileData.beneficiary_name,
    emergency_contact_name: profileData.emergency_contact_name,
    emergency_contact_phone: profileData.emergency_contact_phone,
    instructions: profileData.instructions,
  });

  const sql = getSql();
  const updated = await sql`
    UPDATE qr_activations
    SET
      status = 'claimed',
      claimed_at = NOW(),
      claimed_by_user_id = ${userId},
      profile_id = ${profile.id},
      public_slug = ${profile.slug}
    WHERE id = ${activation.id} AND status = 'unclaimed'
    RETURNING id
  `;

  if (!updated[0]) {
    throw new ActivationError(
      "El código fue activado por otra persona. Probá de nuevo.",
      "RACE",
    );
  }

  const refreshed = await findActivationByCode(code);
  if (!refreshed) {
    throw new ActivationError("Error al confirmar activación", "INTERNAL");
  }

  return { profile, activation: refreshed };
}

export type ActivationStats = {
  batch_count: number;
  total_codes: number;
  unclaimed: number;
  claimed: number;
  disabled: number;
  activation_rate: number;
};

export async function getActivationStats(): Promise<ActivationStats> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM qr_product_batches) AS batch_count,
      COUNT(*)::int AS total_codes,
      COUNT(*) FILTER (WHERE status = 'unclaimed')::int AS unclaimed,
      COUNT(*) FILTER (WHERE status = 'claimed')::int AS claimed,
      COUNT(*) FILTER (WHERE status = 'disabled')::int AS disabled
    FROM qr_activations
  `;
  const row = rows[0] as {
    batch_count: number;
    total_codes: number;
    unclaimed: number;
    claimed: number;
    disabled: number;
  };

  const activation_rate =
    row.total_codes > 0
      ? Math.round((row.claimed / row.total_codes) * 100)
      : 0;

  return { ...row, activation_rate };
}

export async function getProductBatchById(
  batchId: string,
): Promise<Omit<QrProductBatchRow, "unclaimed_count" | "claimed_count" | "disabled_count"> | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, partner_name, product_label, notes, quantity, created_at
    FROM qr_product_batches
    WHERE id = ${batchId}
    LIMIT 1
  `;
  return (rows[0] as Omit<QrProductBatchRow, "unclaimed_count" | "claimed_count" | "disabled_count"> | undefined) ?? null;
}

export async function listProductBatches(): Promise<QrProductBatchRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      b.id, b.partner_name, b.product_label, b.notes, b.quantity, b.created_at,
      COUNT(*) FILTER (WHERE a.status = 'unclaimed')::int AS unclaimed_count,
      COUNT(*) FILTER (WHERE a.status = 'claimed')::int AS claimed_count,
      COUNT(*) FILTER (WHERE a.status = 'disabled')::int AS disabled_count
    FROM qr_product_batches b
    LEFT JOIN qr_activations a ON a.batch_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `;
  return rows as QrProductBatchRow[];
}

export async function listActivationsByBatch(
  batchId: string,
): Promise<QrActivationRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      a.id, a.batch_id, a.profile_id, a.activation_code, a.public_slug,
      a.status, a.claimed_at, a.claimed_by_user_id, a.created_at,
      b.partner_name, b.product_label
    FROM qr_activations a
    LEFT JOIN qr_product_batches b ON b.id = a.batch_id
    WHERE a.batch_id = ${batchId}
    ORDER BY a.created_at ASC
  `;
  return rows as QrActivationRow[];
}

export async function createProductBatch(input: {
  partner_name: string;
  product_label?: string | null;
  notes?: string | null;
  quantity: number;
}): Promise<{ batch: QrProductBatchRow; activations: QrActivationRow[] }> {
  const quantity = Math.min(Math.max(input.quantity, 1), 500);
  const sql = getSql();

  const batchRows = await sql`
    INSERT INTO qr_product_batches (partner_name, product_label, notes, quantity)
    VALUES (
      ${input.partner_name.trim()},
      ${input.product_label?.trim() || null},
      ${input.notes?.trim() || null},
      ${quantity}
    )
    RETURNING id, partner_name, product_label, notes, quantity, created_at
  `;
  const batch = batchRows[0] as {
    id: string;
    partner_name: string;
    product_label: string | null;
    notes: string | null;
    quantity: number;
    created_at: string;
  };

  const slugPrefix =
    input.product_label?.trim() || input.partner_name.trim() || "producto";
  const activations: QrActivationRow[] = [];
  const usedCodes = new Set<string>();

  for (let i = 0; i < quantity; i++) {
    let code = generateActivationCode();
    let attempts = 0;
    while (usedCodes.has(code) && attempts < 10) {
      code = generateActivationCode();
      attempts++;
    }
    usedCodes.add(code);

    const publicSlug = generateProductSlug(`${slugPrefix}-${i + 1}`);

    const rows = await sql`
      INSERT INTO qr_activations (batch_id, activation_code, public_slug, status)
      VALUES (${batch.id}, ${code}, ${publicSlug}, 'unclaimed')
      RETURNING
        id, batch_id, profile_id, activation_code, public_slug,
        status, claimed_at, claimed_by_user_id, created_at
    `;
    const row = rows[0] as QrActivationRow;
    activations.push({
      ...row,
      partner_name: batch.partner_name,
      product_label: batch.product_label,
    });
  }

  const batchRow: QrProductBatchRow = {
    ...batch,
    unclaimed_count: quantity,
    claimed_count: 0,
    disabled_count: 0,
  };

  return { batch: batchRow, activations };
}
