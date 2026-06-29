export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

export function isBloodType(value: string): value is BloodType {
  return (BLOOD_TYPES as readonly string[]).includes(value);
}

export function normalizeBloodType(
  value: string | null | undefined,
): BloodType | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim().toUpperCase();
  return isBloodType(trimmed) ? trimmed : null;
}
