import { Bell, QrCode, Shield } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { AuthForm } from "@/components/auth/AuthForm";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
};

const BENEFITS = [
  {
    icon: QrCode,
    text: "Creá perfiles QR para personas, mascotas u objetos en minutos.",
  },
  {
    icon: Bell,
    text: "Recibí alertas push cuando alguien escanea o pide ayuda.",
  },
  {
    icon: Shield,
    text: "Contacto directo, ubicación y chat desde un solo panel.",
  },
] as const;

export function AuthPageShell({ mode, error }: AuthPageShellProps) {
  const isLogin = mode === "login";

  return (
    <div className="min-h-dvh bg-[#faf9fc]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-8 lg:flex-row lg:items-center lg:gap-16 lg:py-12">
        <section className="mb-10 lg:mb-0 lg:flex-1">
          <BrandLogo size="lg" />
          <h1 className="mt-8 text-3xl font-black leading-tight text-neutral-900 sm:text-4xl">
            {isLogin ? "Bienvenido de nuevo" : "Empezá con SOSme"}
          </h1>
          <p className="mt-4 max-w-md text-lg text-neutral-600">
            {isLogin
              ? "Ingresá a tu panel para gestionar perfiles, ver alertas y descargar tus QR."
              : "Creá tu cuenta gratis y configurá el primer perfil QR en pocos minutos."}
          </p>

          <ul className="mt-8 hidden space-y-4 lg:block">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-neutral-700">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="pt-1.5 text-sm leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full lg:max-w-md">
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-violet-500/10 backdrop-blur-sm sm:p-8">
            <h2 className="text-xl font-bold text-neutral-900">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {isLogin
                ? "Usá Google o tu email y contraseña."
                : "Registrate con Google o con email."}
            </p>

            <div className="mt-6">
              <AuthForm mode={mode} initialError={error} />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-neutral-500">
            Al continuar aceptás los Términos y la Política de Privacidad indicados arriba.
          </p>
        </section>
      </div>
      <LegalFooter compact />
    </div>
  );
}
