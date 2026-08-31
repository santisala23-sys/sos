import Link from "next/link";
import {
  ArrowRight,
  Bell,
  LogIn,
  PawPrint,
  QrCode,
  Shield,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
  redirectTo?: string | null;
};

const TRUST_PILLS = [
  "Sin tarjeta de crédito",
  "Sin instalar apps",
  "Datos protegidos",
] as const;

export function AuthPageShell({ mode, error, redirectTo }: AuthPageShellProps) {
  const isLogin = mode === "login";
  const alternateHref = isLogin ? "/register" : "/login";
  const alternateLabel = isLogin ? "Crear cuenta gratis" : "Iniciar sesión";
  const alternatePrompt = isLogin ? "¿Primera vez en SOSme?" : "¿Ya tenés cuenta?";
  const HeroIcon = isLogin ? LogIn : UserPlus;

  return (
    <MarketingBackground>
      <AuthNavbar mode={mode} />

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-indigo-300/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-[12%] right-[8%] h-48 w-48 rounded-full bg-rose-300/20 blur-3xl"
          aria-hidden
        />

        <div className="relative w-full max-w-[28rem]">
          <div className="text-center">
            <div className="relative mx-auto inline-flex">
              <div
                className="absolute inset-0 rounded-[1.35rem] bg-violet-500/30 blur-xl"
                aria-hidden
              />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700 text-white shadow-xl shadow-violet-600/35 ring-4 ring-white/80">
                <HeroIcon className="h-7 w-7" aria-hidden />
              </span>
            </div>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-200/90 bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-violet-600" aria-hidden />
              {isLogin ? "Acceso al panel" : "Alta de tutor"}
            </p>

            <h1 className="mt-5 text-[2rem] font-black leading-tight tracking-tight text-neutral-900 sm:text-[2.35rem]">
              {isLogin ? (
                <>
                  Bienvenido
                  <span className="mt-1 block bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                    de vuelta a SOSme
                  </span>
                </>
              ) : (
                <>
                  Creá tu cuenta
                  <span className="mt-1 block bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                    y activá tu QR
                  </span>
                </>
              )}
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-600 sm:text-base">
              {isLogin
                ? "Ingresá con Google o tu email para ver alertas, perfiles y la libreta sanitaria."
                : "Registrate en un minuto. Después escaneás el QR de tu chapita, collar o colgante."}
            </p>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            {(isLogin
              ? [
                  { icon: QrCode, label: "Tus QRs" },
                  { icon: Bell, label: "Alertas" },
                  { icon: Shield, label: "Seguro" },
                ]
              : [
                  { icon: UserPlus, label: "1. Registro" },
                  { icon: QrCode, label: "2. Escaneá QR" },
                  { icon: PawPrint, label: "3. Listo" },
                ]
            ).map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/85 px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-violet-600" aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-white/90 bg-white/95 p-6 shadow-[0_24px_80px_-24px_rgba(109,40,217,0.45)] backdrop-blur-xl sm:p-8">
            <div
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/80 to-transparent"
              aria-hidden
            />
            <AuthForm mode={mode} initialError={error} redirectTo={redirectTo} />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-600">
            {alternatePrompt}{" "}
            <Link
              href={alternateHref}
              className="inline-flex items-center gap-1 font-bold text-violet-700 underline-offset-4 transition hover:text-violet-900 hover:underline"
            >
              {alternateLabel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {TRUST_PILLS.map((pill, index) => (
              <span key={pill} className="flex items-center gap-3 text-xs text-neutral-500">
                {pill}
                {index < TRUST_PILLS.length - 1 && (
                  <span className="hidden text-neutral-300 sm:inline" aria-hidden>
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
