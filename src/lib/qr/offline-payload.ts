/** Datos que entran en el QR de respaldo, legible sin abrir una página. */
export type OfflineQrInput = {
  profileType?: string | null;
  beneficiaryName: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  secondaryContactName?: string | null;
  secondaryContactPhone?: string | null;
  instructions?: string | null;
  allergies?: string | null;
  bloodType?: string | null;
  medicalNotes?: string | null;
};

/**
 * Tope en bytes UTF-8. Con corrección media el QR queda en versión 9
 * (unas 53 celdas): se lee en una tarjeta impresa, no en una chapita minúscula.
 */
const MAX_BYTES = 190;

function clean(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clip(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

function fits(lines: string[]): boolean {
  return byteLength(lines.join("\n")) <= MAX_BYTES;
}

export function buildOfflineQrText(input: OfflineQrInput): string {
  const name = clip(clean(input.beneficiaryName), 40) || "Sin nombre";
  const lines = ["SOSme", name];

  const contact = clip(clean(input.emergencyContactName), 32);
  const phone = clip(clean(input.emergencyContactPhone), 24);
  if (contact && fits([...lines, contact])) lines.push(contact);
  if (phone && fits([...lines, phone])) lines.push(phone);

  const type =
    input.profileType === "pet" || input.profileType === "object"
      ? input.profileType
      : "person";

  const extras: string[] = [];
  if (type === "person") {
    const blood = clip(clean(input.bloodType), 8);
    if (blood) extras.push(`Sangre ${blood}`);
    const allergy = clip(clean(input.allergies), 48);
    if (allergy) extras.push(`Alergia ${allergy}`);
    const meds = clip(clean(input.medicalNotes), 48);
    if (meds) extras.push(meds);
  }

  const phone2 = clip(clean(input.secondaryContactPhone), 24);
  const contact2 = clip(clean(input.secondaryContactName), 24);
  if (phone2 && phone2 !== phone) {
    const secondary = contact2 ? `2do ${phone2} ${contact2}` : phone2;
    extras.push(clip(secondary, 56));
  }

  const instructions = clip(clean(input.instructions), 70);
  if (instructions) extras.push(instructions);

  for (const line of extras) {
    if (!fits([...lines, line])) continue;
    lines.push(line);
  }

  return lines.join("\n");
}

export function offlineQrFromProfile(profile: {
  profile_type?: string | null;
  beneficiary_name: string;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  secondary_contact_name?: string | null;
  secondary_contact_phone?: string | null;
  instructions?: string | null;
  allergies?: string | null;
  blood_type?: string | null;
  medical_notes?: string | null;
}): OfflineQrInput {
  return {
    profileType: profile.profile_type,
    beneficiaryName: profile.beneficiary_name,
    emergencyContactName: profile.emergency_contact_name,
    emergencyContactPhone: profile.emergency_contact_phone,
    secondaryContactName: profile.secondary_contact_name,
    secondaryContactPhone: profile.secondary_contact_phone,
    instructions: profile.instructions,
    allergies: profile.allergies,
    bloodType: profile.blood_type,
    medicalNotes: profile.medical_notes,
  };
}
