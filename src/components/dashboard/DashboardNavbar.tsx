"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Package,
  PawPrint,
  QrCode,
  ShoppingBag,
  UserCircle2,
} from "lucide-react";
import type { QrProfile } from "@/types/database";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HamburgerButton } from "@/components/shared/HamburgerButton";
import { MobileNavDrawer } from "@/components/shared/MobileNavDrawer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, id: "panel" },
  {
    href: "/dashboard/actividad",
    label: "Actividad",
    icon: Activity,
    id: "actividad",
  },
  {
    href: "/dashboard/perfil",
    label: "Perfil",
    icon: UserCircle2,
    id: "perfil",
  },
] as const;

type ProfileLimitStatus = {
  maxProfiles: number;
  currentCount: number;
  activeCount?: number;
};

function NavSectionLabel({ children }: { children: string }) {
  return (
    <p className="mb-1.5 mt-4 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600 first:mt-0">
      {children}
    </p>
  );
}

function drawerLinkClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-3 rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors",
    active
      ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
      : "text-neutral-800 hover:bg-violet-50 hover:text-violet-800",
  );
}

function drawerSubLinkClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
    active
      ? "bg-violet-100 text-violet-900"
      : "text-neutral-700 hover:bg-violet-50 hover:text-violet-800",
  );
}

export function DashboardNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileLimit, setProfileLimit] = useState<ProfileLimitStatus | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profiles, setProfiles] = useState<QrProfile[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        if (d?.plan) setProfileLimit(d.plan);
      })
      .catch(() => setProfileLimit(null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        const res = await fetch("/api/qr-profiles");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setProfiles(data.profiles ?? []);
      } catch {
        /* ignore */
      }
    }

    loadProfiles();
    const interval = setInterval(loadProfiles, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname, open]);

  useEffect(() => {
    let cancelled = false;

    async function loadUnread() {
      try {
        const res = await fetch("/api/scan-logs");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setUnreadCount(data.unreadCount ?? 0);
      } catch {
        /* ignore */
      }
    }

    loadUnread();
    const interval = setInterval(loadUnread, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pathname]);

  const isLogDetail = pathname.startsWith("/dashboard/logs/");
  const isActividad =
    pathname === "/dashboard/actividad" || isLogDetail;
  const isPerfil = pathname === "/dashboard/perfil";

  const petProfiles = profiles.filter((p) => p.profile_type === "pet");
  const personProfiles = profiles.filter((p) => p.profile_type === "person");
  const objectProfiles = profiles.filter((p) => p.profile_type === "object");

  function isActive(id: (typeof NAV_LINKS)[number]["id"]) {
    if (id === "actividad") return isActividad;
    if (id === "perfil") return isPerfil;
    return pathname === "/dashboard" && !isActividad && !isPerfil;
  }

  function isProfilePath(id: string, suffix = "") {
    return pathname === `/dashboard/perfiles/${id}${suffix}`;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function renderNavLabel(id: string, label: string) {
    const showBadge = id === "actividad" && unreadCount > 0;
    return (
      <span className="inline-flex items-center gap-2">
        {label}
        {showBadge && (
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-sm"
            aria-label={`${unreadCount} alertas sin leer`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
    );
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
              {profileLimit
                ? `${profileLimit.activeCount ?? profileLimit.currentCount}/${profileLimit.maxProfiles} QR activos`
                : "Gestioná tus perfiles y alertas"}
            </span>
          </span>
        </div>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación del panel"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon, id }) => {
            const active = isActive(id);
            const alertHighlight = id === "actividad" && unreadCount > 0 && !active;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
                  active
                    ? "bg-violet-100 text-violet-800"
                    : alertHighlight
                      ? "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                      : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {renderNavLabel(id, label)}
              </Link>
            );
          })}
          <Link
            href="/#catalogo"
            className="relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium text-neutral-600 transition-colors hover:bg-violet-50 hover:text-violet-800"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden />
            Tienda
          </Link>
          <Link
            href="/ayuda"
            className={cn(
              "relative inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-medium transition-colors",
              pathname === "/ayuda"
                ? "bg-violet-100 text-violet-800"
                : "text-neutral-600 hover:bg-violet-50 hover:text-violet-800",
            )}
          >
            <HelpCircle className="h-4 w-4" aria-hidden />
            Ayuda
          </Link>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={handleLogout}
            className="gap-2 px-4 text-base"
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
        {profileLimit && (
          <p className="mb-4 rounded-2xl bg-violet-50 px-4 py-3 text-sm text-violet-800">
            {(profileLimit.activeCount ?? profileLimit.currentCount)}/
            {profileLimit.maxProfiles} QR activos
          </p>
        )}

        <nav className="flex flex-col gap-1.5" aria-label="Navegación móvil del panel">
          {NAV_LINKS.filter((l) => l.id !== "perfil").map(
            ({ href, label, icon: Icon, id }) => {
              const active = isActive(id);
              const alertHighlight =
                id === "actividad" && unreadCount > 0 && !active;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    drawerLinkClass(active),
                    !active &&
                      alertHighlight &&
                      "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {renderNavLabel(id, label)}
                </Link>
              );
            },
          )}

          {petProfiles.length > 0 && (
            <div className="mt-2">
              <NavSectionLabel>Mascotas</NavSectionLabel>
              <div className="space-y-3">
                {petProfiles.map((pet) => {
                  const editHref = `/dashboard/perfiles/${pet.id}/editar?from=${encodeURIComponent("/dashboard#mascotas")}`;
                  const libretaHref = `/dashboard/perfiles/${pet.id}/libreta`;
                  const editActive =
                    pathname.startsWith(`/dashboard/perfiles/${pet.id}/editar`);
                  const libretaActive = isProfilePath(pet.id, "/libreta");

                  return (
                    <div
                      key={pet.id}
                      className="rounded-2xl border border-teal-100 bg-teal-50/40 p-2.5"
                    >
                      <div className="mb-1.5 flex items-center gap-2 px-1.5">
                        <PawPrint
                          className="h-4 w-4 shrink-0 text-teal-700"
                          aria-hidden
                        />
                        <p className="truncate text-sm font-black text-teal-950">
                          {pet.beneficiary_name}
                        </p>
                        <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                          Mascota
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={editHref}
                          className={drawerSubLinkClass(editActive)}
                          onClick={() => setOpen(false)}
                        >
                          <QrCode className="h-4 w-4 shrink-0" aria-hidden />
                          Perfil QR
                        </Link>
                        <Link
                          href={libretaHref}
                          className={drawerSubLinkClass(libretaActive)}
                          onClick={() => setOpen(false)}
                        >
                          <ClipboardList
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                          />
                          Libreta sanitaria
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {personProfiles.length > 0 && (
            <div className="mt-2">
              <NavSectionLabel>Personas</NavSectionLabel>
              <div className="flex flex-col gap-1">
                {personProfiles.map((person) => {
                  const href = `/dashboard/perfiles/${person.id}`;
                  const active =
                    isProfilePath(person.id) ||
                    pathname.startsWith(`/dashboard/perfiles/${person.id}/`);
                  return (
                    <Link
                      key={person.id}
                      href={href}
                      className={drawerLinkClass(active)}
                      onClick={() => setOpen(false)}
                    >
                      <UserCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                      <span className="truncate">{person.beneficiary_name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {objectProfiles.length > 0 && (
            <div className="mt-2">
              <NavSectionLabel>Objetos</NavSectionLabel>
              <div className="flex flex-col gap-1">
                {objectProfiles.map((object) => {
                  const href = `/dashboard/perfiles/${object.id}`;
                  const active =
                    isProfilePath(object.id) ||
                    pathname.startsWith(`/dashboard/perfiles/${object.id}/`);
                  return (
                    <Link
                      key={object.id}
                      href={href}
                      className={drawerLinkClass(active)}
                      onClick={() => setOpen(false)}
                    >
                      <Package className="h-5 w-5 shrink-0" aria-hidden />
                      <span className="truncate">{object.beneficiary_name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-2">
            <NavSectionLabel>Más</NavSectionLabel>
            <div className="flex flex-col gap-1.5">
              <Link
                href="/ayuda"
                className={drawerLinkClass(pathname === "/ayuda")}
                onClick={() => setOpen(false)}
              >
                <HelpCircle className="h-5 w-5 shrink-0" aria-hidden />
                Ayuda
              </Link>
              <Link
                href="/#catalogo"
                className={drawerLinkClass(false)}
                onClick={() => setOpen(false)}
              >
                <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
                Tienda
              </Link>
              <Link
                href="/dashboard/perfil"
                className={drawerLinkClass(isPerfil)}
                onClick={() => setOpen(false)}
              >
                <UserCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                Perfil
              </Link>
            </div>
          </div>
        </nav>

        <div className="mt-6 flex flex-col gap-2.5 border-t border-neutral-100 pt-6">
          <Button
            type="button"
            variant="danger"
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
