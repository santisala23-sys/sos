import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("aviso-emergencia");

export default function AvisoEmergenciaPage() {
  return <LegalPage slug="aviso-emergencia" />;
}
