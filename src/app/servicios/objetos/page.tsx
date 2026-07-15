import type { Metadata } from "next";
import { ServicePage } from "@/components/marketing/ServicePage";
import { SERVICES } from "@/lib/marketing/services";

const service = SERVICES.objetos;

export const metadata: Metadata = {
  title: service.title,
  description: service.heroSupport,
};

export default function ObjetosServicePage() {
  return <ServicePage service={service} />;
}
