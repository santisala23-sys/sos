"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Home,
  LayoutDashboard,
  Menu,
  Shield,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/admin", label: "Resumen", icon: BarChart3 },
  { href: "/dashboard", label: "Panel tutor", icon: LayoutDashboard },
  { href: "/", label: "Inicio", icon: Home },
] as const;

export function AdminNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
            Control Center
            <br />
            <span className="inline-flex items-center gap-1.5 font-semibold text-violet-700">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Administración SOSme
            </span>
          </span>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación de administración"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
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

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 lg:hidden"
          aria-expanded={open}
          aria-controls="admin-mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="admin-mobile-nav"
          className="mx-auto mt-3 w-full max-w-[96rem] overflow-hidden rounded-2xl border border-violet-200/60 bg-white/96 p-5 shadow-2xl shadow-violet-500/10 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil admin">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
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
          <div className="mt-5 border-t border-neutral-100 pt-5">
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Ir al panel tutor
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
