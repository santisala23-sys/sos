import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { ContactoPageContent } from "@/components/marketing/ContactoPageContent";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function ContactoPage() {
  return (
    <MarketingBackground>
      <ContactoPageContent />
      <MarketingFooter />
    </MarketingBackground>
  );
}
