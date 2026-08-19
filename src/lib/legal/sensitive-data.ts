import type { ProfileType } from "@/types/database";

export function profileHasSensitiveData(params: {
  profileType: ProfileType;
  allergies?: string | null;
  medicalNotes?: string | null;
  bloodType?: string | null;
  healthInsurance?: string | null;
  hasClinicalPdf?: boolean;
}): boolean {
  if (params.profileType !== "person") {
    return Boolean(params.profileType === "pet" && params.hasClinicalPdf);
  }

  return (
    Boolean(params.allergies?.trim()) ||
    Boolean(params.medicalNotes?.trim()) ||
    Boolean(params.bloodType?.trim()) ||
    Boolean(params.healthInsurance?.trim())
  );
}
