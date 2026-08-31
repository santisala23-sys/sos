import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";

export const metadata: Metadata = {
  title: "Ayuda",
  description:
    "Preguntas frecuentes y manual del tutor SOSme: panel, QRs de emergencia y libreta sanitaria.",
};

export default function DashboardAyudaPage() {
  return <HelpPageContent loggedIn dashboard />;
}
