"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { HamburgerButton } from "@/components/shared/HamburgerButton";
import { MobileNavDrawer } from "@/components/shared/MobileNavDrawer";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/tienda", label: "Tienda" },
  { href: "/pricing", label: "Planes" },
] as const;

type AuthNavbarProps = {
  mode: "login" | "register";
};

export function AuthNavbar({ mode }: AuthNavbarProps) {
  const isRegister = mode === "register";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[96rem] items-center justify-between gap-6 rounded-2xl border border-white/80 bg-white/90 px-5 py-3.5 shadow-lg shadow-violet-500/10 sm:px-8 sm:py-4">
        <BrandLogo size="lg" showMark />

        <nav
          className="hidden items-center gap-1 sm:gap-2 lg:flex"
          aria-label="Navegación de autenticación"
        >
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-4 py-2.5 text-base font-medium text-neutral-600 transition-colors hover:bg-violet-50 hover:text-violet-800"
            >
              {label}
            </Link>
          ))}
          {isRegister ? (
            <Link href="/login">
              <Button variant="ghost" size="md" className="px-5 text-base">
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="md"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-base shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-indigo-700"
              >
                Empezar gratis
              </Button>
            </Link>
          )}
        </nav>

        <HamburgerButton
          open={open}
          controls="auth-mobile-nav"
          className="lg:hidden"
          onClick={() => setOpen((value) => !value)}
        />
      </div>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        id="auth-mobile-nav"
        title="Menú"
        hiddenFrom="lg"
      >
        <nav className="flex flex-col gap-1.5" aria-label="Navegación móvil">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl px-4 py-3.5 text-base font-semibold text-neutral-800 transition-colors hover:bg-violet-50 hover:text-violet-800"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 border-t border-neutral-100 pt-6">
          {isRegister ? (
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="secondary" size="lg" className="w-full">
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Empezar gratis
              </Button>
            </Link>
          )}
        </div>
      </MobileNavDrawer>
    </header>
  );
}
