import { LEGAL_VERSION } from "@/lib/legal/constants";
import { profileHasSensitiveData } from "@/lib/legal/sensitive-data";
import type { ProfileType } from "@/types/database";

export function validateSensitiveDataConsent(params: {
  profileType: ProfileType;
  allergies?: string | null;
  medicalNotes?: string | null;
  bloodType?: string | null;
  hasClinicalPdf?: boolean;
  sensitiveDataConsent?: boolean;
  alreadyConsented?: boolean;
}): string | null {
  if (
    !profileHasSensitiveData({
      profileType: params.profileType,
      allergies: params.allergies,
      medicalNotes: params.medicalNotes,
      bloodType: params.bloodType,
      hasClinicalPdf: params.hasClinicalPdf,
    })
  ) {
    return null;
  }

  if (params.alreadyConsented) {
    return null;
  }

  if (!params.sensitiveDataConsent) {
    return "Para guardar datos médicos necesitás confirmar el consentimiento";
  }

  return null;
}

export function sensitiveConsentFields(consented: boolean) {
  if (!consented) {
    return {
      sensitive_data_consent_at: null,
      sensitive_data_consent_version: null,
    };
  }

  return {
    sensitive_data_consent_at: new Date().toISOString(),
    sensitive_data_consent_version: LEGAL_VERSION,
  };
}
