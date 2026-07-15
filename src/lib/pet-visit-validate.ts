import { normalizeVisitTags } from "@/lib/pet-medical";
import type { VisitTag } from "@/types/database";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ParsedVisitBody = {
  visit_date: string;
  summary: string;
  indications: string;
  tags: VisitTag[];
  vet_name: string | null;
  vet_license: string | null;
};

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

  return {
    ok: true,
    data: {
      visit_date: visitDate,
      summary,
      indications,
      tags,
      vet_name: vetName || null,
      vet_license: vetLicense || null,
    },
  };
}
