import type { VisitTag } from "@/types/database";

export const VISIT_TAGS: { value: VisitTag; label: string }[] = [
  { value: "checkup", label: "Consulta" },
  { value: "vaccine", label: "Vacuna" },
  { value: "deworming", label: "Desparasitación" },
  { value: "treatment", label: "Tratamiento" },
];

export function isVisitTag(value: unknown): value is VisitTag {
  return (
    value === "vaccine" ||
    value === "deworming" ||
    value === "treatment" ||
    value === "checkup"
  );
}

export function normalizeVisitTags(raw: unknown): VisitTag[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<VisitTag>();
  for (const item of raw) {
    if (isVisitTag(item)) seen.add(item);
  }
  return [...seen];
}

export function visitTagLabel(tag: VisitTag): string {
  return VISIT_TAGS.find((t) => t.value === tag)?.label ?? tag;
}

const TOKEN_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return TOKEN_RE.test(value);
}

export function formatVisitDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(
    new Date(y, m - 1, d),
  );
}
