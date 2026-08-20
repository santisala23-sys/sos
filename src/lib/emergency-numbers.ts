export type OfficialEmergencyNumber = {
  dial: string;
  label: string;
  hint: string;
};

/**
 * Números nacionales de emergencia en Argentina.
 * En la mayoría de jurisdicciones el 911 unifica; 107 y 100 siguen siendo útiles
 * según el tipo de urgencia. No dependen de geolocalización precisa.
 */
export const ARGENTINA_EMERGENCY_NUMBERS: OfficialEmergencyNumber[] = [
  {
    dial: "911",
    label: "911 · Emergencias",
    hint: "Policía / emergencias unificadas",
  },
  {
    dial: "107",
    label: "107 · Emergencias médicas",
    hint: "SAME / atención médica",
  },
  {
    dial: "100",
    label: "100 · Bomberos",
    hint: "Incendios y rescate",
  },
];

export function getOfficialEmergencyNumbers(_opts?: {
  countryCode?: string | null;
}): OfficialEmergencyNumber[] {
  // Mercado principal de SOSme. Si más adelante hay más países, ramificar acá.
  return ARGENTINA_EMERGENCY_NUMBERS;
}
