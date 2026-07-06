import type { Metadata } from "next";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

export const metadata: Metadata = {
  title: "Panel de control",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingBackground>
      <AdminNavbar />
      <main className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </MarketingBackground>
  );
}
