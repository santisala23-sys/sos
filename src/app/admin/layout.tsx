import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Shield } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";

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
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <div className="hidden h-6 w-px bg-neutral-700 sm:block" />
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-300">
              <Shield className="h-4 w-4" aria-hidden />
              Control Center
            </div>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Overview
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Panel tutor
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
