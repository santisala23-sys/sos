import type { ProfileType } from "@/types/database";

export function profileHasSensitiveData(params: {
  profileType: ProfileType;
  allergies?: string | null;
  medicalNotes?: string | null;
  bloodType?: string | null;
  healthInsurance?: string | null;
}): boolean {
  if (params.profileType !== "person") {
    return false;
  }

  return (
    Boolean(params.allergies?.trim()) ||
    Boolean(params.medicalNotes?.trim()) ||
    Boolean(params.bloodType?.trim()) ||
    Boolean(params.healthInsurance?.trim())
  );
}
