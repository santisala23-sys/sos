import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/ServicePage";
import { PersonaStoreProducts } from "@/components/store/PersonaStoreProducts";
import { SERVICES } from "@/lib/marketing/services";

const service = SERVICES.personas;

export const metadata: Metadata = {
  title: service.title,
  description: service.heroSupport,
};

export default function PersonasServicePage() {
  return (
    <ServicePage
      service={service}
      productSlot={<PersonaStoreProducts />}
    />
  );
}
