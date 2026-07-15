import { normalizeVisitTags } from "@/lib/pet-medical";
import type { VisitTag } from "@/types/database";
import type { VisitAttachmentInput } from "@/lib/db/queries-pet-medical";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ATTACHMENTS = 3;

export type ParsedVisitBody = {
  visit_date: string;
  summary: string;
  indications: string;
  tags: VisitTag[];
  vet_name: string | null;
  vet_license: string | null;
  attachments: VisitAttachmentInput[];
};

function parseAttachments(raw: unknown):
  | { ok: true; files: VisitAttachmentInput[] }
  | { ok: false; error: string } {
  if (raw == null) return { ok: true, files: [] };
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Adjuntos inválidos" };
  }
  if (raw.length > MAX_ATTACHMENTS) {
    return { ok: false, error: `Máximo ${MAX_ATTACHMENTS} archivos por visita` };
  }

  const files: VisitAttachmentInput[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") {
      return { ok: false, error: "Adjunto inválido" };
    }
    const row = item as Record<string, unknown>;
    const filename =
      typeof row.filename === "string" ? row.filename.trim() : "";
    const mime = typeof row.mime === "string" ? row.mime.trim() : "";
    const data =
      typeof row.data === "string"
        ? row.data
        : typeof row.base64Data === "string"
          ? row.base64Data
          : "";
    if (!filename || !mime || !data) {
      return { ok: false, error: "Cada adjunto necesita nombre, tipo y datos" };
    }
    files.push({ filename, mime, base64Data: data });
  }
  return { ok: true, files };
}

export function parseVisitBody(
  body: unknown,
  options: { requireVetIdentity: boolean },
): { ok: true; data: ParsedVisitBody } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "JSON inválido" };
  }

  const raw = body as Record<string, unknown>;
  const visitDate =
    typeof raw.visit_date === "string" ? raw.visit_date.trim() : "";
  if (!DATE_RE.test(visitDate)) {
    return { ok: false, error: "Fecha inválida (usá YYYY-MM-DD)" };
  }

  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  if (summary.length < 3 || summary.length > 4000) {
    return {
      ok: false,
      error: "Contá qué se hizo en la visita (mínimo 3 caracteres)",
    };
  }

  const indications =
    typeof raw.indications === "string"
      ? raw.indications.trim().slice(0, 4000)
      : "";

  const tags = normalizeVisitTags(raw.tags);

  const vetName =
    typeof raw.vet_name === "string" ? raw.vet_name.trim() : "";
  const vetLicense =
    typeof raw.vet_license === "string" ? raw.vet_license.trim() : "";

  if (options.requireVetIdentity) {
    if (vetName.length < 2 || vetName.length > 120) {
      return { ok: false, error: "El nombre del veterinario es obligatorio" };
    }
    if (vetLicense.length < 2 || vetLicense.length > 60) {
      return { ok: false, error: "La matrícula es obligatoria" };
    }
  } else {
    if (vetName && (vetName.length < 2 || vetName.length > 120)) {
      return { ok: false, error: "Nombre del veterinario inválido" };
    }
    if (vetLicense && (vetLicense.length < 2 || vetLicense.length > 60)) {
      return { ok: false, error: "Matrícula inválida" };
    }
  }

  const attachments = parseAttachments(raw.attachments);
  if (!attachments.ok) return attachments;

  return {
    ok: true,
    data: {
      visit_date: visitDate,
      summary,
      indications,
      tags,
      vet_name: vetName || null,
      vet_license: vetLicense || null,
      attachments: attachments.files,
    },
  };
}

const DATE_OR_EMPTY = /^\d{4}-\d{2}-\d{2}$/;

export function parsePreventiveBody(
  body: unknown,
  options: { requireKind: boolean },
):
  | {
      ok: true;
      data: {
        kind?: "vaccine" | "deworming";
        name: string;
        last_applied_at: string | null;
        next_due_at: string | null;
        notes: string;
      };
    }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "JSON inválido" };
  }
  const raw = body as Record<string, unknown>;
  const kind = raw.kind;
  if (options.requireKind) {
    if (kind !== "vaccine" && kind !== "deworming") {
      return { ok: false, error: "Tipo inválido (vacuna o desparasitación)" };
    }
  } else if (kind !== undefined && kind !== "vaccine" && kind !== "deworming") {
    return { ok: false, error: "Tipo inválido" };
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (name.length < 1 || name.length > 200) {
    return { ok: false, error: "El nombre es obligatorio" };
  }

  const lastRaw =
    typeof raw.last_applied_at === "string" ? raw.last_applied_at.trim() : "";
  const nextRaw =
    typeof raw.next_due_at === "string" ? raw.next_due_at.trim() : "";

  if (lastRaw && !DATE_OR_EMPTY.test(lastRaw)) {
    return { ok: false, error: "Fecha de aplicación inválida" };
  }
  if (nextRaw && !DATE_OR_EMPTY.test(nextRaw)) {
    return { ok: false, error: "Fecha de próxima dosis inválida" };
  }

  const notes =
    typeof raw.notes === "string" ? raw.notes.trim().slice(0, 1000) : "";

  return {
    ok: true,
    data: {
      ...(kind === "vaccine" || kind === "deworming" ? { kind } : {}),
      name,
      last_applied_at: lastRaw || null,
      next_due_at: nextRaw || null,
      notes,
    },
  };
}
