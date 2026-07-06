import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/Button";

type AuthNavProps = {
  mode: "login" | "register";
};

export function AuthNav({ mode }: AuthNavProps) {
  const isRegister = mode === "register";

  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo size="md" showMark />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden text-sm font-medium text-neutral-600 transition-colors hover:text-violet-700 sm:inline"
          >
            Inicio
          </Link>
          {isRegister ? (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Crear cuenta
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
