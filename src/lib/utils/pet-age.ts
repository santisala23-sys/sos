const MONTHS_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export function normalizePetBirthDateIso(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}

export function formatPetBirthDate(isoDate: string): string {
  const normalized = normalizePetBirthDateIso(isoDate);
  if (!normalized) return isoDate;
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const label = MONTHS_ES[month - 1] ?? String(month);
  return `${day} ${label} ${year}`;
}

export function describePetAge(
  birthDateIso: string,
  referenceDate = new Date(),
): string | null {
  const normalized = normalizePetBirthDateIso(birthDateIso);
  if (!normalized) return null;

  const birth = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;

  let years = referenceDate.getFullYear() - birth.getFullYear();
  let months = referenceDate.getMonth() - birth.getMonth();
  if (referenceDate.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return null;

  if (years === 0) {
    return months <= 0 ? "menos de 1 mes" : `${months} mes${months === 1 ? "" : "es"}`;
  }

  if (months === 0) {
    return `${years} año${years === 1 ? "" : "s"}`;
  }

  return `${years} año${years === 1 ? "" : "s"} y ${months} mes${months === 1 ? "" : "es"}`;
}
