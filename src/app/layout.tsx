import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  GoogleTagManagerBody,
  GoogleTagManagerHead,
} from "@/components/analytics/GoogleTagManager";
import { getAppUrl } from "@/lib/utils/app-url";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "SOSme — Tu QR personal de emergencia y contacto",
    template: "%s | SOSme",
  },
  description:
    "Creá perfiles QR para personas, mascotas u objetos. Alertas push, ubicación y contacto directo cuando alguien escanea.",
  applicationName: "SOSme",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <GoogleTagManagerHead />
      <body className="min-h-full flex flex-col antialiased">
        <GoogleTagManagerBody />
        {children}
      </body>
    </html>
  );
}
