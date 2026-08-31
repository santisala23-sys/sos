import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  PawPrint,
  QrCode,
  Shield,
  Sparkles,
} from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
  redirectTo?: string | null;
};

const LOGIN_FEATURES = [
  { icon: QrCode, text: "Activá y gestioná tus productos QR" },
  { icon: Bell, text: "Recibí alertas al instante" },
  { icon: Shield, text: "Libreta sanitaria y perfiles seguros" },
] as const;

const REGISTER_STEPS = [
  "Creá tu cuenta en un minuto",
  "Escaneá el QR de tu chapita o collar",
  "Completá los datos y listo",
] as const;

function AuthSidePanel({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";

  return (
    <aside className="relative hidden overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-900 p-8 text-white shadow-2xl shadow-violet-600/30 lg:flex lg:min-h-[34rem] lg:flex-col lg:justify-between xl:p-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative">
        <BrandLogo href="/" size="md" showMark tone="dark" />
        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-violet-100">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {isLogin ? "Panel del tutor" : "Primer paso"}
        </p>
        <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight xl:text-4xl">
          {isLogin ? (
            <>
              Todo lo que importa,
              <span className="mt-1 block text-violet-200">en un solo lugar.</span>
            </>
          ) : (
            <>
              Tu cuenta SOSme
              <span className="mt-1 block text-violet-200">empieza acá.</span>
            </>
          )}
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-violet-100">
          {isLogin
            ? "Ingresá para ver alertas de escaneo, editar perfiles de emergencia y la libreta sanitaria de tus mascotas."
            : "Registrate para activar el QR de tu producto y vincularlo a tu cuenta. Después podés entrar con Google o con email."}
        </p>
      </div>

      <div className="relative mt-10 space-y-4">
        {isLogin
          ? LOGIN_FEATURES.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-white">{text}</span>
              </div>
            ))
          : REGISTER_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-black">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-violet-100">{step}</span>
              </div>
            ))}

        {!isLogin && (
          <div className="mt-2 flex items-start gap-3 rounded-2xl border border-teal-300/30 bg-teal-500/15 px-4 py-3">
            <PawPrint className="mt-0.5 h-5 w-5 shrink-0 text-teal-100" aria-hidden />
            <p className="text-sm leading-relaxed text-teal-50">
              Cada perfil requiere un producto SOSme con QR propio. Después del
              registro, escanealo desde el panel.
            </p>
          </div>
        )}
      </div>

      <p className="relative mt-8 text-xs text-violet-200/80">
        Sin apps · Funciona en el navegador · Datos protegidos
      </p>
    </aside>
  );
}

function MobileAuthHeader({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";

  return (
    <div className="mb-8 text-center lg:hidden">
      <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-violet-800 shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" aria-hidden />
        {isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}
      </p>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
        {isLogin ? "Ingresá a SOSme" : "Empezá con SOSme"}
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-600">
        {isLogin
          ? "Google o email para acceder a tu panel."
          : "Registrate y activá el QR de tu producto."}
      </p>
    </div>
  );
}

export function AuthPageShell({ mode, error, redirectTo }: AuthPageShellProps) {
  const isLogin = mode === "login";
  const alternateHref = isLogin ? "/register" : "/login";
  const alternateLabel = isLogin ? "Crear cuenta" : "Iniciar sesión";
  const alternatePrompt = isLogin ? "¿Todavía no tenés cuenta?" : "¿Ya tenés cuenta?";

  return (
    <MarketingBackground>
      <AuthNavbar mode={mode} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid w-full items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,28rem)]">
          <AuthSidePanel mode={mode} />

          <div className="flex flex-col justify-center">
            <MobileAuthHeader mode={mode} />

            <div className="hidden lg:block">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900 xl:text-3xl">
                {isLogin ? "Iniciar sesión" : "Crear cuenta"}
              </h1>
              <p className="mt-2 text-sm text-neutral-600">
                {isLogin
                  ? "Elegí Google o ingresá con tu email."
                  : "Completá tus datos para activar tu producto."}
              </p>
            </div>

            <div className="mt-0 rounded-[1.75rem] border border-violet-100/80 bg-white/95 p-6 shadow-xl shadow-violet-500/10 backdrop-blur-sm sm:p-8 lg:mt-6">
              <AuthForm mode={mode} initialError={error} redirectTo={redirectTo} />
            </div>

            <p className="mt-5 text-center text-sm text-neutral-600">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="inline-flex items-center gap-1 font-semibold text-violet-700 underline-offset-2 hover:underline"
              >
                {alternateLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </p>

            {!isLogin && (
              <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-neutral-500">
                <CheckCircle2
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                  aria-hidden
                />
                Después del registro vas a poder escanear el QR de tu chapita,
                collar o colgante.
              </p>
            )}
          </div>
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
