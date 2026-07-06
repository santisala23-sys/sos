import Link from "next/link";
import { Bell, QrCode, Shield, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { AuthForm } from "@/components/auth/AuthForm";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
  redirectTo?: string | null;
};

const BENEFITS = [
  {
    icon: QrCode,
    text: "1 perfil QR gratis para persona, mascota u objeto.",
  },
  {
    icon: Bell,
    text: "Alertas push cuando alguien escanea tu código.",
  },
  {
    icon: Shield,
    text: "WhatsApp, llamada y ubicación desde un solo panel.",
  },
] as const;

export function AuthPageShell({ mode, error, redirectTo }: AuthPageShellProps) {
  const isLogin = mode === "login";

  if (!isLogin) {
    return (
      <MarketingBackground>
        <MarketingNavbar variant="subpage" />

        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[88rem] items-center px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
            <section className="hidden lg:block">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
                <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
                Empezá gratis en minutos
              </p>
              <h1 className="mt-6 text-4xl font-black leading-tight text-neutral-900">
                Creá tu cuenta{" "}
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  SOSme
                </span>
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-neutral-600">
                Registrate con Google o email. Configurá tu perfil de emergencia y
                descargá el QR para imprimir.
              </p>
              <ul className="mt-8 space-y-4">
                {BENEFITS.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-neutral-700">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="pt-2 text-sm leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mx-auto w-full max-w-md lg:mx-0">
              <div className="mb-5 text-center lg:hidden">
                <BrandLogo size="lg" showMark className="justify-center" />
                <h1 className="mt-4 text-2xl font-black text-neutral-900">
                  Creá tu cuenta SOSme
                </h1>
                <p className="mt-2 text-sm text-neutral-600">
                  Gratis con 1 perfil QR incluido
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-7">
                <div className="hidden lg:block">
                  <h2 className="text-xl font-bold text-neutral-900">Crear cuenta</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Google al instante o registro con email
                  </p>
                </div>

                <div className="lg:mt-5">
                  <AuthForm mode="register" initialError={error} redirectTo={redirectTo} />
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-neutral-500">
                <Link href="/tienda" className="font-medium text-violet-700 hover:underline">
                  Tienda
                </Link>
                {" · "}
                <Link href="/pricing" className="font-medium text-violet-700 hover:underline">
                  Planes
                </Link>
                {" · "}
                <Link href="/login" className="font-medium text-violet-700 hover:underline">
                  Ingresar
                </Link>
              </p>
            </section>
          </div>
        </div>

        <LegalFooter compact />
      </MarketingBackground>
    );
  }

  return (
    <div className="min-h-dvh bg-[#faf9fc]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-4 py-8 lg:flex-row lg:items-center lg:gap-16 lg:py-12">
        <section className="mb-8 lg:mb-0 lg:flex-1">
          <BrandLogo size="lg" />
          <h1 className="mt-6 text-3xl font-black leading-tight text-neutral-900 sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-4 max-w-md text-lg text-neutral-600">
            Ingresá a tu panel para gestionar perfiles, ver alertas y descargar tus QR.
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
            <h2 className="text-xl font-bold text-neutral-900">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Usá Google o tu email y contraseña.
            </p>

            <div className="mt-6">
              <AuthForm mode="login" initialError={error} redirectTo={redirectTo} />
            </div>
          </div>
        </section>
      </div>
      <LegalFooter compact />
    </div>
  );
}
