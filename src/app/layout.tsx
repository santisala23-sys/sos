import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { getAppUrl } from "@/lib/utils/app-url";
import { CookieConsentBanner } from "@/components/legal/CookieConsentBanner";
import { FloatingWhatsAppButton } from "@/components/shared/FloatingWhatsAppButton";

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
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "SOSme",
    title: "SOSme — Tu QR personal de emergencia y contacto",
    description:
      "SOSme vincula un código QR a tu perfil de emergencia. Quien lo escanea sabe cómo contactarte y vos recibís la alerta al instante.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "SOSme",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SOSme — Tu QR personal de emergencia y contacto",
    description:
      "SOSme vincula un código QR a tu perfil de emergencia. Quien lo escanea sabe cómo contactarte y vos recibís la alerta al instante.",
    images: ["/icon.png"],
  },
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
      <body className="min-h-full flex flex-col antialiased">
        <GoogleTagManager />
        {children}
        <FloatingWhatsAppButton />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
