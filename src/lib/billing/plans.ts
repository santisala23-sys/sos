export type PlanTier = "free" | "extended" | "partner";

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  maxProfiles: number;
  description: string;
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratis",
    maxProfiles: 1,
    description: "Un perfil QR con alertas, ubicación y chat.",
  },
  extended: {
    id: "extended",
    name: "Ampliado",
    maxProfiles: 99,
    description: "Varios perfiles QR para familia, mascotas y objetos.",
  },
  partner: {
    id: "partner",
    name: "Marca / partner",
    maxProfiles: 999,
    description: "Lotes de QR para productos físicos y activación por etiqueta.",
  },
};

export const FREE_PLAN = PLANS.free;
