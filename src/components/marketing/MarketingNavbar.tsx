"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HamburgerButton } from "@/components/shared/HamburgerButton";
import { MobileNavDrawer } from "@/components/shared/MobileNavDrawer";
import { Button } from "@/components/ui/Button";
import {
  SERVICES,
  SERVICE_LIST,
  type ServiceSlug,
} from "@/lib/marketing/services";
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
  activeService?: ServiceSlug;
};

function resolveHref(href: string, variant: "home" | "subpage") {
  if (href.startsWith("#") && variant === "subpage") {
    return `/${href}`;
  }
  return href;
}

function UseCaseNavMenu({
  variant,
  activeService,
  onNavigate,
  layout,
}: {
  variant: "home" | "subpage";
  activeService: ServiceSlug;
  onNavigate?: () => void;
  layout: "desktop" | "mobile";
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const homeHref = resolveHref("#casos", variant);
  const current = SERVICES[activeService];

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    onNavigate?.();
  };

  if (layout === "mobile") {
    return (
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              Casos de uso
            </p>
            <p className="mt-1 text-sm font-semibold text-neutral-800">
              Estás en{" "}
              <span className="text-violet-700">{current.navLabel}</span>
            </p>
          </div>
          <Link
            href={homeHref}
            onClick={closeMenu}
            className="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-800"
          >
            Ver todos
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {SERVICE_LIST.map((service) => {
            const isActive = service.slug === activeService;
            return (
              <Link
                key={service.slug}
                href={service.href}
                onClick={closeMenu}
                className={cn(
                  "rounded-xl px-2 py-2.5 text-center text-sm font-semibold transition-all",
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "bg-white text-neutral-700 ring-1 ring-violet-100 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                {service.navLabel}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
          menuOpen
            ? "bg-violet-100 text-violet-800"
            : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
        )}
      >
        <span>Casos de uso</span>
        <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-bold text-white">
          {current.navLabel}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", menuOpen && "rotate-180")}
          aria-hidden
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.45rem)] z-50 min-w-[14.5rem] overflow-hidden rounded-2xl border border-violet-100/90 bg-white p-2 shadow-xl shadow-violet-500/15"
        >
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            Cambiar caso de uso
          </p>
          {SERVICE_LIST.map((service) => {
            const isActive = service.slug === activeService;
            return (
              <Link
                key={service.slug}
                href={service.href}
                role="menuitem"
                onClick={closeMenu}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-violet-600 text-white"
                    : "text-neutral-700 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                {service.navLabel}
                {isActive && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </Link>
            );
          })}
          <div className="my-1.5 border-t border-neutral-100" />
          <Link
            href={homeHref}
            role="menuitem"
            onClick={closeMenu}
            className="block rounded-xl px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-violet-700"
          >
            Ver resumen en el inicio
          </Link>
        </div>
      )}
    </div>
  );
}

export function MarketingNavbar({
  variant = "home",
  activeService,
}: MarketingNavbarProps) {
  const pathname = usePathname();
  const detectedService = pathname.match(/^\/servicios\/(personas|mascotas|objetos)/)?.[1] as
    | ServiceSlug
    | undefined;
  const currentService = activeService ?? detectedService;
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-3 transition-[padding] duration-200 sm:px-6 lg:px-8",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[96rem] items-center justify-between gap-6 rounded-2xl border px-5 py-3.5 transition-[box-shadow,background-color,border-color] duration-200 sm:px-8 sm:py-4",
          scrolled
            ? "border-violet-200/70 bg-white/95 shadow-xl shadow-violet-500/10"
            : "border-white/80 bg-white/90 shadow-lg shadow-violet-500/10",
        )}
      >
        <div className="flex min-w-0 items-center gap-4 lg:gap-5">
          <BrandLogo size="lg" showMark />
          <span className="hidden border-l border-neutral-200 pl-5 text-sm leading-snug text-neutral-500 2xl:block">
            Contacto de emergencia
            <br />
            <span className="font-semibold text-violet-700">
              con un simple QR
            </span>
          </span>
        </div>

        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const resolved = resolveHref(href, variant);
            const active = isActive(href);

            if (href === "#casos" && currentService) {
              return (
                <UseCaseNavMenu
                  key={href}
                  variant={variant}
                  activeService={currentService}
                  layout="desktop"
                />
              );
            }

            return (
              <Link
                key={href}
                href={resolved}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
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

        <div className="hidden items-center gap-3 xl:flex">
          <Link href="/login">
            <Button variant="ghost" size="md" className="px-5 text-base">
              Ingresar
            </Button>
          </Link>
          <Link href="/register">
            <Button
              size="md"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-base shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
            >
              Empezar gratis
            </Button>
          </Link>
        </div>

        <HamburgerButton
          open={open}
          controls="mobile-nav"
          className="xl:hidden"
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        id="mobile-nav"
        hiddenFrom="xl"
      >
        <nav className="flex flex-col gap-1.5" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ href, label }) => {
            const resolved = resolveHref(href, variant);
            const active = isActive(href);

            if (href === "#casos" && currentService) {
              return (
                <UseCaseNavMenu
                  key={href}
                  variant={variant}
                  activeService={currentService}
                  onNavigate={() => setOpen(false)}
                  layout="mobile"
                />
              );
            }

            return (
              <Link
                key={href}
                href={resolved}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
                  active
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                    : "text-neutral-800 hover:bg-violet-50 hover:text-violet-800",
                )}
                onClick={() => setOpen(false)}
              >
                {label}
                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-opacity",
                    active ? "opacity-90" : "opacity-35",
                  )}
                  aria-hidden
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-100 pt-6">
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
      </MobileNavDrawer>
    </header>
  );
}
