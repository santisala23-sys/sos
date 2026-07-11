import type { Metadata } from "next";
import { AdminBackground } from "@/components/admin/AdminBackground";

export const metadata: Metadata = {
  title: "Panel de control",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminBackground>{children}</AdminBackground>;
}
