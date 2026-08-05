import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { ContactoPageContent } from "@/components/marketing/ContactoPageContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { getSession } from "@/lib/auth/session";

export default async function ContactoPage() {
  const session = await getSession();
  const loggedIn = Boolean(session);

  return (
    <MarketingBackground>
      {loggedIn ? <DashboardNavbar /> : null}
      <ContactoPageContent loggedIn={loggedIn} />
      {!loggedIn && <MarketingFooter />}
    </MarketingBackground>
  );
}
