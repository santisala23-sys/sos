import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp para más perfiles QR, productos con tu marca o cualquier consulta sobre SOSme.",
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
