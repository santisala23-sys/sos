export type ProfileType = "person" | "pet" | "object";

export const PROFILE_TYPES: {
  value: ProfileType;
  label: string;
  description: string;
}[] = [
  {
    value: "person",
    label: "Persona",
    description:
      "Asistencia, alergias, tipo de sangre, obra social y contactos de emergencia.",
  },
  {
    value: "pet",
    label: "Mascota",
    description:
      "Contacto del dueño e instrucciones si la encuentran.",
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
  instructionsRequired: boolean;
  publicHeader: string;
  /** Etiqueta corta para la vista pública: "Persona", "Mascota", "Objeto". */
  publicTypeLabel: string;
  showAllergies: boolean;
  showMedicalNotes: boolean;
  showBloodType: boolean;
  showHealthInsurance: boolean;
  allergiesLabel: string;
  medicalNotesLabel: string;
  medicalNotesPlaceholder: string;
  healthInsuranceLabel: string;
  healthInsurancePlaceholder: string;
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
    instructionsRequired: true,
    publicHeader: "Perfil de asistencia",
    publicTypeLabel: "Persona",
    showAllergies: true,
    showMedicalNotes: true,
    showBloodType: true,
    showHealthInsurance: true,
    allergiesLabel: "Alergias",
    medicalNotesLabel: "Condiciones médicas crónicas / Medicación",
    medicalNotesPlaceholder:
      "Ej: Diabetes, marcapasos, anticoagulantes, asma controlada con inhalador...",
    healthInsuranceLabel: "Obra social / prepaga y N° de socio",
    healthInsurancePlaceholder: "Ej: OSDE 310 / Swiss Medical 12345678",
  },
  pet: {
    beneficiaryLabel: "Nombre de la mascota",
    beneficiaryPlaceholder: "Ej: Firulais",
    contactLabel: "Nombre del dueño / contacto",
    contactPlaceholder: "Ej: María Pérez",
    instructionsLabel: "Instrucciones si la encuentran",
    instructionsPlaceholder:
      "Ej: Es tranquilo pero asusta con ruidos fuertes. Llamar al dueño antes de acercarse.",
    instructionsRequired: false,
    publicHeader: "Mascota — contacto del dueño",
    publicTypeLabel: "Mascota",
    showAllergies: false,
    showMedicalNotes: false,
    showBloodType: false,
    showHealthInsurance: false,
    allergiesLabel: "Alergias o restricciones",
    medicalNotesLabel: "Datos veterinarios (opcional)",
    medicalNotesPlaceholder: "Vacunas, chip, condiciones, veterinario habitual...",
    healthInsuranceLabel: "",
    healthInsurancePlaceholder: "",
  },
  object: {
    beneficiaryLabel: "Nombre o descripción del objeto",
    beneficiaryPlaceholder: "Ej: Valija negra Samsonite / MacBook Pro 14",
    contactLabel: "Nombre del propietario",
    contactPlaceholder: "Ej: Carlos García",
    instructionsLabel: "Qué hacer si lo encontrás",
    instructionsPlaceholder:
      "Ej: Contiene documentación importante. Hay recompensa. Llamar o escribir al contacto.",
    instructionsRequired: true,
    publicHeader: "Objeto perdido — contacto",
    publicTypeLabel: "Objeto",
    showAllergies: false,
    showMedicalNotes: false,
    showBloodType: false,
    showHealthInsurance: false,
    allergiesLabel: "",
    medicalNotesLabel: "",
    medicalNotesPlaceholder: "",
    healthInsuranceLabel: "",
    healthInsurancePlaceholder: "",
  },
};

export function getProfileTypeConfig(type: ProfileType | string | null | undefined) {
  if (type === "pet" || type === "object") return CONFIG[type];
  return CONFIG.person;
}

export function isProfileType(value: string): value is ProfileType {
  return value === "person" || value === "pet" || value === "object";
}

export function resolveProfileType(
  value: string | null | undefined,
): ProfileType {
  if (value && isProfileType(value)) return value;
  return "person";
}

export type ActivationTypeCopy = {
  title: string;
  subtitle: string;
  formTitle: string;
  formHint: string;
  loginTitle: string;
  loginBody: string;
};

export function getActivationTypeCopy(
  type: ProfileType | string | null | undefined,
): ActivationTypeCopy {
  const resolved = resolveProfileType(type);
  if (resolved === "pet") {
    return {
      title: "Activar QR de mascota",
      subtitle: "Este código es para una chapita o collar.",
      formTitle: "Datos de tu mascota",
      formHint: "Foto, contactos e instrucciones si alguien encuentra a tu mascota.",
      loginTitle: "Activá la chapita de tu mascota",
      loginBody:
        "Creá una cuenta o ingresá para vincular este QR a tu mascota. Después, quien la encuentre ve cómo avisarte.",
    };
  }
  if (resolved === "object") {
    return {
      title: "Activar QR de objeto",
      subtitle: "Este código es para un objeto, valija o equipo.",
      formTitle: "Datos del objeto",
      formHint: "Completá cómo contactarte si lo encuentran.",
      loginTitle: "Activá el QR de tu objeto",
      loginBody:
        "Creá una cuenta o ingresá para vincular este QR a tu objeto. Quien lo encuentre va a poder avisarte.",
    };
  }
  return {
    title: "Activar QR de persona",
    subtitle: "Este código es para un perfil de emergencia personal.",
    formTitle: "Datos de emergencia",
    formHint: "Completá los datos que verán quienes escaneen el QR.",
    loginTitle: "Activá tu producto una sola vez",
    loginBody:
      "Creá una cuenta o ingresá para vincular este QR a tu perfil. Después, quien escanee ve tus datos de contacto — sin instalar apps.",
  };
}
