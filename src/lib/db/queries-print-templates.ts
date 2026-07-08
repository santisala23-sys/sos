import { getSql } from "@/lib/db/index";
import {
  createDefaultLayoutForSize,
  parsePrintTemplateLayout,
  slugifyTemplateName,
  type PrintTemplateLayout,
  type PrintTemplateRow,
} from "@/lib/activation/print-template-types";

function mapPrintTemplateRow(row: Record<string, unknown>): PrintTemplateRow {
  const layout =
    parsePrintTemplateLayout(row.layout_json) ?? createDefaultLayoutForSize(40, 40);

  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    page_width_mm: Number(row.page_width_mm),
    page_height_mm: Number(row.page_height_mm),
    layout_json: layout,
    cut_layer_enabled: Boolean(row.cut_layer_enabled),
    is_default: Boolean(row.is_default),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listPrintTemplates(): Promise<PrintTemplateRow[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default, created_at, updated_at
    FROM print_templates
    ORDER BY is_default DESC, name ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapPrintTemplateRow);
}

export async function getPrintTemplateById(
  id: string,
): Promise<PrintTemplateRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default, created_at, updated_at
    FROM print_templates
    WHERE id = ${id}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPrintTemplateRow(row) : null;
}

export async function getDefaultPrintTemplate(): Promise<PrintTemplateRow | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default, created_at, updated_at
    FROM print_templates
    WHERE is_default = true
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPrintTemplateRow(row) : null;
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const sql = getSql();
  let slug = baseSlug || "plantilla";
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const rows = excludeId
      ? await sql`
          SELECT id FROM print_templates
          WHERE slug = ${candidate} AND id <> ${excludeId}
          LIMIT 1
        `
      : await sql`
          SELECT id FROM print_templates WHERE slug = ${candidate} LIMIT 1
        `;
    if (rows.length === 0) return candidate;
    suffix++;
  }
}

export async function createPrintTemplate(input: {
  name: string;
  slug?: string;
  page_width_mm: number;
  page_height_mm: number;
  layout_json?: PrintTemplateLayout;
  cut_layer_enabled?: boolean;
  is_default?: boolean;
}): Promise<PrintTemplateRow> {
  const sql = getSql();
  const name = input.name.trim();
  const baseSlug = slugifyTemplateName(input.slug?.trim() || name);
  const slug = await ensureUniqueSlug(baseSlug);
  const layout =
    input.layout_json ??
    createDefaultLayoutForSize(input.page_width_mm, input.page_height_mm);

  if (input.is_default) {
    await sql`UPDATE print_templates SET is_default = false WHERE is_default = true`;
  }

  const rows = await sql`
    INSERT INTO print_templates (
      name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default
    )
    VALUES (
      ${name},
      ${slug},
      ${input.page_width_mm},
      ${input.page_height_mm},
      ${layout},
      ${input.cut_layer_enabled ?? false},
      ${input.is_default ?? false}
    )
    RETURNING
      id, name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default, created_at, updated_at
  `;

  return mapPrintTemplateRow(rows[0] as Record<string, unknown>);
}

export async function updatePrintTemplate(
  id: string,
  input: {
    name?: string;
    slug?: string;
    page_width_mm?: number;
    page_height_mm?: number;
    layout_json?: PrintTemplateLayout;
    cut_layer_enabled?: boolean;
    is_default?: boolean;
  },
): Promise<PrintTemplateRow | null> {
  const existing = await getPrintTemplateById(id);
  if (!existing) return null;

  const sql = getSql();
  const name = input.name?.trim() ?? existing.name;
  let slug = existing.slug;

  if (input.slug !== undefined) {
    const baseSlug = slugifyTemplateName(input.slug.trim() || name);
    slug = await ensureUniqueSlug(baseSlug, id);
  }

  const pageWidth = input.page_width_mm ?? existing.page_width_mm;
  const pageHeight = input.page_height_mm ?? existing.page_height_mm;
  const layout = input.layout_json ?? existing.layout_json;
  const cutLayer =
    input.cut_layer_enabled ?? existing.cut_layer_enabled;
  const isDefault = input.is_default ?? existing.is_default;

  if (isDefault) {
    await sql`UPDATE print_templates SET is_default = false WHERE is_default = true AND id <> ${id}`;
  }

  const rows = await sql`
    UPDATE print_templates
    SET
      name = ${name},
      slug = ${slug},
      page_width_mm = ${pageWidth},
      page_height_mm = ${pageHeight},
      layout_json = ${layout},
      cut_layer_enabled = ${cutLayer},
      is_default = ${isDefault},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id, name, slug, page_width_mm, page_height_mm, layout_json,
      cut_layer_enabled, is_default, created_at, updated_at
  `;

  const row = rows[0] as Record<string, unknown> | undefined;
  return row ? mapPrintTemplateRow(row) : null;
}

export async function deletePrintTemplate(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM print_templates
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length > 0;
}
