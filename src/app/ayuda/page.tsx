import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Ayuda y preguntas frecuentes",
  description:
    "Preguntas frecuentes y manual del tutor SOSme: panel, QRs de emergencia, libreta sanitaria y acceso veterinario.",
};

export default async function AyudaPage() {
  const session = await getSession();

  return (
    <>
      <HelpPageContent loggedIn={Boolean(session)} />
      <MarketingFooter />
    </>
  );
}
