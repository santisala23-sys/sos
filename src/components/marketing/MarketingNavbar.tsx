"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "#que-es", label: "Qué es" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#casos", label: "Casos de uso" },
  { href: "/tienda", label: "Tienda" },
  { href: "/pricing", label: "Planes" },
] as const;

type MarketingNavbarProps = {
  variant?: "home" | "subpage";
};

function resolveHref(href: string, variant: "home" | "subpage") {
  if (href.startsWith("#") && variant === "subpage") {
    return `/${href}`;
  }
  return href;
}

export function MarketingNavbar({ variant = "home" }: MarketingNavbarProps) {
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

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 transition-[padding] duration-300",
        scrolled ? "py-2.5" : "py-5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-5 rounded-2xl border px-5 py-3.5 transition-all duration-300 sm:px-6 sm:py-4",
          scrolled
            ? "border-violet-200/70 bg-white/92 shadow-xl shadow-violet-500/8 backdrop-blur-xl"
            : "border-white/80 bg-white/80 shadow-md shadow-violet-500/8 backdrop-blur-lg",
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <BrandLogo size="lg" showMark />
          <span className="hidden border-l border-neutral-200 pl-4 text-sm leading-snug text-neutral-500 xl:block">
            Contacto de emergencia
            <br />
            <span className="font-semibold text-violet-700">
              con un simple QR
            </span>
          </span>
        </div>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const resolved = resolveHref(href, variant);
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={resolved}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors",
                  active
                    ? "bg-violet-100 text-violet-800"
                    : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login">
            <Button variant="ghost" size="md" className="text-[15px]">
              Ingresar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="md"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 px-5 shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
            >
              Empezar gratis
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition-colors hover:bg-neutral-50 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="mx-auto mt-3 max-w-6xl overflow-hidden rounded-2xl border border-violet-200/60 bg-white/96 p-5 shadow-2xl shadow-violet-500/10 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV_LINKS.map(({ href, label }) => {
              const resolved = resolveHref(href, variant);
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={resolved}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                    active
                      ? "bg-violet-100 text-violet-800"
                      : "text-neutral-700 hover:bg-violet-50 hover:text-violet-800",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 flex flex-col gap-2.5 border-t border-neutral-100 pt-5">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="lg" className="w-full">
                Ingresar
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
