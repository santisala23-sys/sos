import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingBackground>
      <DashboardNavbar />
      {children}
    </MarketingBackground>
  );
}
