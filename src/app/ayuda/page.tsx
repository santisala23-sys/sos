import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Ayuda y preguntas frecuentes",
  description:
    "Preguntas frecuentes y manual del tutor SOSme: panel, QRs de emergencia, libreta sanitaria y acceso veterinario.",
};

export default async function AyudaPage() {
  const session = await getSession();
  const loggedIn = Boolean(session);

  return (
    <MarketingBackground>
      {loggedIn ? <DashboardNavbar /> : null}
      <HelpPageContent loggedIn={loggedIn} />
      {!loggedIn && <MarketingFooter />}
    </MarketingBackground>
  );
}
