"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  UserCircle2,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, hash: null },
  { href: "/dashboard#perfiles", label: "Mis perfiles", icon: UserCircle2, hash: "perfiles" },
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
  const [isAdmin, setIsAdmin] = useState(false);
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
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  const isLogDetail = pathname.startsWith("/dashboard/logs/");

  function isActive(linkHash: (typeof NAV_LINKS)[number]["hash"]) {
    if (linkHash === "actividad") {
      return isLogDetail || (pathname === "/dashboard" && hash === "#actividad");
    }
    if (linkHash === "perfiles") {
      return pathname === "/dashboard" && hash === "#perfiles";
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
        "sticky top-0 z-50 px-3 transition-[padding] duration-300 sm:px-6 lg:px-8",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[96rem] items-center justify-between gap-4 rounded-2xl border px-5 py-3.5 transition-all duration-300 sm:px-8 sm:py-4",
          scrolled
            ? "border-violet-200/70 bg-white/94 shadow-xl shadow-violet-500/10 backdrop-blur-xl"
            : "border-white/80 bg-white/85 shadow-lg shadow-violet-500/10 backdrop-blur-lg",
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
          {isAdmin && (
            <Link href="/admin">
              <Button variant="ghost" size="md" className="gap-2 px-4 text-base">
                <Shield className="h-4 w-4" aria-hidden />
                Admin
              </Button>
            </Link>
          )}
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

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 lg:hidden"
          aria-expanded={open}
          aria-controls="dashboard-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="dashboard-mobile-nav"
          className="mx-auto mt-3 w-full max-w-[96rem] overflow-hidden rounded-2xl border border-violet-200/60 bg-white/96 p-5 shadow-2xl shadow-violet-500/10 backdrop-blur-xl lg:hidden"
        >
          {planStatus && (
            <p className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
              <span className="font-semibold">{planStatus.planName}</span>
              {" · "}
              {(planStatus.activeCount ?? planStatus.currentCount)}/{planStatus.currentCount} QR activos
            </p>
          )}
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil del panel">
            {NAV_LINKS.map(({ href, label, icon: Icon, hash: linkHash }) => {
              const active = isActive(linkHash);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                    active
                      ? "bg-violet-100 text-violet-800"
                      : "text-neutral-700 hover:bg-violet-50 hover:text-violet-800",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-100 pt-5">
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)}>
                <Button variant="secondary" size="lg" className="w-full gap-2">
                  <Shield className="h-4 w-4" aria-hidden />
                  Admin
                </Button>
              </Link>
            )}
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
        </div>
      )}
    </header>
  );
}
