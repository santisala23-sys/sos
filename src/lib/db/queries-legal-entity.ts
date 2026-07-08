import { getSql } from "@/lib/db/index";
import {
  EMPTY_LEGAL_ENTITY_SETTINGS,
  type LegalEntitySettings,
} from "@/lib/legal/entity-settings";

type LegalEntityRow = {
  legal_name: string | null;
  cuit: string | null;
  address: string | null;
  jurisdiction: string | null;
  privacy_email: string | null;
  updated_at: string;
};

function mapRow(row: LegalEntityRow | undefined): LegalEntitySettings {
  if (!row) return EMPTY_LEGAL_ENTITY_SETTINGS;
  return {
    legal_name: row.legal_name,
    cuit: row.cuit,
    address: row.address,
    jurisdiction: row.jurisdiction,
    privacy_email: row.privacy_email,
    updated_at: row.updated_at,
  };
}

export async function getLegalEntitySettings(): Promise<LegalEntitySettings> {
  const sql = getSql();
  const rows = await sql`
    SELECT legal_name, cuit, address, jurisdiction, privacy_email, updated_at
    FROM legal_entity_settings
    WHERE id = 'default'
    LIMIT 1
  `;
  return mapRow(rows[0] as LegalEntityRow | undefined);
}

export async function updateLegalEntitySettings(data: {
  legal_name?: string | null;
  cuit?: string | null;
  address?: string | null;
  jurisdiction?: string | null;
  privacy_email?: string | null;
}): Promise<LegalEntitySettings> {
  const sql = getSql();
  const current = await getLegalEntitySettings();

  const rows = await sql`
    UPDATE legal_entity_settings
    SET
      legal_name = ${data.legal_name !== undefined ? data.legal_name : current.legal_name},
      cuit = ${data.cuit !== undefined ? data.cuit : current.cuit},
      address = ${data.address !== undefined ? data.address : current.address},
      jurisdiction = ${data.jurisdiction !== undefined ? data.jurisdiction : current.jurisdiction},
      privacy_email = ${data.privacy_email !== undefined ? data.privacy_email : current.privacy_email},
      updated_at = NOW()
    WHERE id = 'default'
    RETURNING legal_name, cuit, address, jurisdiction, privacy_email, updated_at
  `;
  return mapRow(rows[0] as LegalEntityRow | undefined);
}
