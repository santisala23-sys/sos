import type { Metadata } from "next";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

export const metadata: Metadata = {
  title: "Panel de control",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MarketingBackground>{children}</MarketingBackground>;
}
