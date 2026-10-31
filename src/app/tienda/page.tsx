import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { StoreCatalogSection } from "@/components/store/StoreCatalogSection";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Elegí tu producto con QR. Sumá al carrito y contactanos por WhatsApp para coordinar pago y envío.",
};

export default function TiendaPage() {
  return (
    <>
      <MarketingNavbar variant="subpage" />
      <main>
        <StoreCatalogSection />
      </main>
      <MarketingFooter />
    </>
  );
}
