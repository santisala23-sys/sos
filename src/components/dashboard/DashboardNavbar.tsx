"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  PawPrint,
  UserCircle2,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HamburgerButton } from "@/components/shared/HamburgerButton";
import { MobileNavDrawer } from "@/components/shared/MobileNavDrawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, hash: null },
  { href: "/dashboard#perfiles", label: "Perfiles QR", icon: UserCircle2, hash: "perfiles" },
  { href: "/dashboard#mascotas", label: "Mascotas", icon: PawPrint, hash: "mascotas" },
  { href: "/dashboard#actividad", label: "Actividad", icon: Activity, hash: "actividad" },
] as const;

type PlanStatus = {
  planName: string;
  maxProfiles: number;
  currentCount: number;
  activeCount?: number;
};

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.plan) setPlanStatus(d.plan);
      })
      .catch(() => setPlanStatus(null));
  }, []);

  const isLogDetail = pathname.startsWith("/dashboard/logs/");

  function isActive(linkHash: (typeof NAV_LINKS)[number]["hash"]) {
    if (linkHash === "actividad") {
      return isLogDetail || (pathname === "/dashboard" && hash === "#actividad");
    }
    if (linkHash === "perfiles") {
      return pathname === "/dashboard" && hash === "#perfiles";
    }
    if (linkHash === "mascotas") {
      return pathname === "/dashboard" && hash === "#mascotas";
    }
    return pathname === "/dashboard" && !hash && !isLogDetail;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-3 transition-[padding] duration-200 sm:px-6 lg:px-8",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[96rem] items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 transition-[box-shadow,background-color,border-color] duration-200 sm:px-8 sm:py-4",
          scrolled
            ? "border-violet-200/70 bg-white/95 shadow-xl shadow-violet-500/10"
            : "border-white/80 bg-white/90 shadow-lg shadow-violet-500/10",
        )}
      >
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
          <BrandLogo size="lg" showMark />
          <span className="hidden border-l border-neutral-200 pl-5 text-sm leading-snug text-neutral-500 lg:block">
            Panel del tutor
            <br />
            <span className="font-semibold text-violet-700">
              {planStatus
                ? `${planStatus.planName} · ${(planStatus.activeCount ?? planStatus.currentCount)}/${planStatus.currentCount} QR activos`
                : "Gestioná tus perfiles y alertas"}
            </span>
          </span>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación del panel"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon, hash: linkHash }) => {
            const active = isActive(linkHash);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
                  active
                    ? "bg-violet-100 text-violet-800"
                    : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleLogout}
            className="gap-2 px-4 text-base text-neutral-600"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </Button>
        </div>

        <HamburgerButton
          open={open}
          controls="dashboard-mobile-nav"
          className="lg:hidden"
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        id="dashboard-mobile-nav"
        title="Panel"
        hiddenFrom="lg"
      >
        {planStatus && (
          <p className="mb-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
            <span className="font-semibold">{planStatus.planName}</span>
            {" · "}
            {(planStatus.activeCount ?? planStatus.currentCount)}/{planStatus.currentCount} QR activos
          </p>
        )}
        <nav className="flex flex-col gap-1.5" aria-label="Navegación móvil del panel">
          {NAV_LINKS.map(({ href, label, icon: Icon, hash: linkHash }) => {
            const active = isActive(linkHash);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
                  active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "text-neutral-800 hover:bg-violet-50 hover:text-violet-800",
                )}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-100 pt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              void handleLogout();
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Salir
          </Button>
        </div>
      </MobileNavDrawer>
    </header>
  );
}
