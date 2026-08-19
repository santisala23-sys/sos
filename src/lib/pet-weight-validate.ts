const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parsePetBirthDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!DATE_RE.test(trimmed)) return null;
  const date = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) return null;
  return trimmed;
}

export function parsePetBreed(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 120) return null;
  return trimmed;
}

export function parseWeightKg(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(",", ".").trim())
        : NaN;
  if (!Number.isFinite(num) || num <= 0 || num > 200) return null;
  return Math.round(num * 100) / 100;
}
