import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("retencion-datos");

export default function RetencionDatosPage() {
  return <LegalPage slug="retencion-datos" />;
}
