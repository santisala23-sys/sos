import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("privacidad");

export default function PrivacidadPage() {
  return <LegalPage slug="privacidad" />;
}
