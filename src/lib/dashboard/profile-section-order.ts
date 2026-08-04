import type { ProfileType } from "@/lib/profile-types";

/** Orden por defecto cuando ninguna sección tiene perfiles. */
export const PROFILE_SECTION_DEFAULT_ORDER: ProfileType[] = [
  "pet",
  "person",
  "object",
];

export function sortProfileSections(
  counts: Record<ProfileType, number>,
): ProfileType[] {
  return [...PROFILE_SECTION_DEFAULT_ORDER].sort((a, b) => {
    const aHas = counts[a] > 0;
    const bHas = counts[b] > 0;
    if (aHas !== bHas) return aHas ? -1 : 1;
    return (
      PROFILE_SECTION_DEFAULT_ORDER.indexOf(a) -
      PROFILE_SECTION_DEFAULT_ORDER.indexOf(b)
    );
  });
}

export function profileSectionHash(type: ProfileType): string {
  if (type === "pet") return "mascotas";
  if (type === "object") return "objetos";
  return "personas";
}

export function dashboardHashForProfileType(
  type: ProfileType | string | undefined,
): string {
  if (type === "pet") return "#mascotas";
  if (type === "object") return "#objetos";
  return "#personas";
}
