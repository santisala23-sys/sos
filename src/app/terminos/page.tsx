import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";

export const metadata = legalMetadata("terminos");

export default function TerminosPage() {
  return <LegalPage slug="terminos" />;
}
