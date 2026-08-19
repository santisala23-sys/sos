import type { Metadata } from "next";
import { PetHealthBookletSection } from "@/components/marketing/PetHealthBookletSection";
import { ServicePage } from "@/components/marketing/ServicePage";
import { SERVICES } from "@/lib/marketing/services";

const service = SERVICES.mascotas;

export const metadata: Metadata = {
  title: service.title,
  description: service.heroSupport,
};

export default function MascotasServicePage() {
  return (
    <ServicePage
      service={service}
      bookletSlot={<PetHealthBookletSection showServiceLink={false} />}
    />
  );
}
