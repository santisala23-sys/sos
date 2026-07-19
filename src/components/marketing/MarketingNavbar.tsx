"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
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

function CasosDeUsoNavItem({
  variant,
  activeService,
  onNavigate,
  className,
  linkClassName,
  subLinkClassName,
}: {
  variant: "home" | "subpage";
  activeService?: ServiceSlug;
  onNavigate?: () => void;
  className?: string;
  linkClassName?: string;
  subLinkClassName?: string;
}) {
  const href = resolveHref("#casos", variant);
  const current = activeService ? SERVICES[activeService] : null;
  const others = activeService
    ? SERVICE_LIST.filter((service) => service.slug !== activeService)
    : [];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Link href={href} className={linkClassName} onClick={onNavigate}>
        {current ? `Casos de uso (${current.navLabel})` : "Casos de uso"}
      </Link>
      {current && others.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1">
          {others.map((service, index) => (
            <span key={service.slug} className="inline-flex items-center gap-2">
              {index > 0 && (
                <span className={cn("text-neutral-300", subLinkClassName)} aria-hidden>
                  ·
                </span>
              )}
              <Link
                href={service.href}
                className={subLinkClassName}
                onClick={onNavigate}
              >
                {service.navLabel}
              </Link>
            </span>
          ))}
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

            if (href === "#casos") {
              return (
                <CasosDeUsoNavItem
                  key={href}
                  variant={variant}
                  activeService={currentService}
                  linkClassName={cn(
                    "rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
                    active
                      ? "bg-violet-100 text-violet-800"
                      : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
                  )}
                  subLinkClassName="text-xs font-semibold text-violet-700 transition-colors hover:text-violet-900"
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

            if (href === "#casos") {
              return (
                <CasosDeUsoNavItem
                  key={href}
                  variant={variant}
                  activeService={currentService}
                  onNavigate={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3.5"
                  linkClassName={cn(
                    "text-base font-semibold transition-colors",
                    active
                      ? "text-violet-700"
                      : "text-neutral-800 hover:text-violet-800",
                  )}
                  subLinkClassName="text-sm font-semibold text-violet-600 transition-colors hover:text-violet-800"
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
