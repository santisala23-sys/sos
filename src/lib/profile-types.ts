export type ProfileType = "person" | "pet" | "object";

export const PROFILE_TYPES: {
  value: ProfileType;
  label: string;
  description: string;
}[] = [
  {
    value: "person",
    label: "Persona",
    description: "Asistencia, alergias, datos médicos y contactos de emergencia.",
  },
  {
    value: "pet",
    label: "Mascota",
    description: "Contacto del dueño e instrucciones si la encuentran.",
  },
  {
    value: "object",
    label: "Objeto / valija / equipo",
    description: "Valija, notebook u otro. Solo contacto e instrucciones básicas.",
  },
];

export type ProfileTypeConfig = {
  beneficiaryLabel: string;
  beneficiaryPlaceholder: string;
  contactLabel: string;
  contactPlaceholder: string;
  instructionsLabel: string;
  instructionsPlaceholder: string;
  publicHeader: string;
  showAllergies: boolean;
  showMedicalNotes: boolean;
  showBloodType: boolean;
  showClinicalPdf: boolean;
  allergiesLabel: string;
  medicalNotesLabel: string;
  medicalNotesPlaceholder: string;
};

const CONFIG: Record<ProfileType, ProfileTypeConfig> = {
  person: {
    beneficiaryLabel: "Nombre de la persona",
    beneficiaryPlaceholder: "Ej: Juan Pérez",
    contactLabel: "Nombre del contacto de emergencia",
    contactPlaceholder: "Ej: María Pérez (madre)",
    instructionsLabel: "Instrucciones de manejo / comportamiento",
    instructionsPlaceholder:
      "Ej: No tolera contacto físico. Hablarle pausado. Sensible a sirenas.",
    publicHeader: "Perfil de asistencia",
    showAllergies: true,
    showMedicalNotes: true,
    showBloodType: true,
    showClinicalPdf: true,
    allergiesLabel: "Alergias",
    medicalNotesLabel: "Información médica",
    medicalNotesPlaceholder:
      "Medicación, condiciones, observaciones para el personal de salud...",
  },
  pet: {
    beneficiaryLabel: "Nombre de la mascota",
    beneficiaryPlaceholder: "Ej: Firulais",
    contactLabel: "Nombre del dueño / contacto",
    contactPlaceholder: "Ej: María Pérez",
    instructionsLabel: "Instrucciones si la encuentran",
    instructionsPlaceholder:
      "Ej: Es tranquilo pero asusta con ruidos fuertes. Llamar al dueño antes de acercarse.",
    publicHeader: "Mascota — contacto del dueño",
    showAllergies: true,
    showMedicalNotes: true,
    showBloodType: false,
    showClinicalPdf: false,
    allergiesLabel: "Alergias o restricciones",
    medicalNotesLabel: "Datos veterinarios (opcional)",
    medicalNotesPlaceholder: "Vacunas, chip, condiciones, veterinario habitual...",
  },
  object: {
    beneficiaryLabel: "Nombre o descripción del objeto",
    beneficiaryPlaceholder: "Ej: Valija negra Samsonite / MacBook Pro 14",
    contactLabel: "Nombre del propietario",
    contactPlaceholder: "Ej: Carlos García",
    instructionsLabel: "Qué hacer si lo encontrás",
    instructionsPlaceholder:
      "Ej: Contiene documentación importante. Hay recompensa. Llamar o escribir al contacto.",
    publicHeader: "Objeto perdido — contacto",
    showAllergies: false,
    showMedicalNotes: false,
    showBloodType: false,
    showClinicalPdf: false,
    allergiesLabel: "",
    medicalNotesLabel: "",
    medicalNotesPlaceholder: "",
  },
};

export function getProfileTypeConfig(type: ProfileType | string | null | undefined) {
  if (type === "pet" || type === "object") return CONFIG[type];
  return CONFIG.person;
}

export function isProfileType(value: string): value is ProfileType {
  return value === "person" || value === "pet" || value === "object";
}
