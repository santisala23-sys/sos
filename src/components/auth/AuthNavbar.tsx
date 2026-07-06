"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type AuthNavbarProps = {
  mode: "login" | "register";
};

export function AuthNavbar({ mode }: AuthNavbarProps) {
  const isRegister = mode === "register";

  return (
    <header className="sticky top-0 z-50 px-3 py-4 sm:px-6 lg:px-8">
      <div
        className={cn(
          "mx-auto flex w-full max-w-[96rem] items-center justify-between gap-6 rounded-2xl border border-white/80 bg-white/85 px-5 py-3.5 shadow-lg shadow-violet-500/10 backdrop-blur-lg sm:px-8 sm:py-4",
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
          className="flex items-center gap-1 sm:gap-2"
          aria-label="Navegación de autenticación"
        >
          <Link
            href="/"
            className="rounded-xl px-4 py-2.5 text-base font-medium text-neutral-600 transition-colors hover:bg-violet-50 hover:text-violet-800"
          >
            Inicio
          </Link>
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
      </div>
    </header>
  );
}
