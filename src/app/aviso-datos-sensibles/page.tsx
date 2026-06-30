import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("aviso-datos-sensibles");

export default function AvisoDatosSensiblesPage() {
  return <LegalPage slug="aviso-datos-sensibles" />;
}
