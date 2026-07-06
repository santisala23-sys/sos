import Link from "next/link";
import { Bell, QrCode, Shield, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
  redirectTo?: string | null;
};

const LOGIN_FEATURES = [
  { icon: QrCode, text: "Gestioná tus perfiles QR" },
  { icon: Bell, text: "Revisá alertas y escaneos" },
  { icon: Shield, text: "Descargá e imprimí tus códigos" },
] as const;

export function AuthPageShell({ mode, error, redirectTo }: AuthPageShellProps) {
  const isLogin = mode === "login";

  return (
    <MarketingBackground>
      <AuthNavbar mode={mode} />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            {isLogin ? (
              <>
                <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
                  <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
                  Bienvenido de nuevo
                </p>
                <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                  Ingresá a tu panel{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    SOSme
                  </span>
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-neutral-600">
                  Accedé con Google o tu email para ver alertas, editar perfiles y
                  descargar tus QR.
                </p>
                <ul className="mx-auto mt-6 flex max-w-xs flex-col gap-2 text-left">
                  {LOGIN_FEATURES.map(({ icon: Icon, text }) => (
                    <li
                      key={text}
                      className="flex items-center gap-2.5 text-sm text-neutral-600"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
                  <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
                  Empezá gratis
                </p>
                <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                  Creá tu cuenta{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    SOSme
                  </span>
                </h1>
                <p className="mt-3 text-base text-neutral-600">
                  1 perfil QR incluido · Sin tarjeta de crédito
                </p>
              </>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-8">
            <AuthForm mode={mode} initialError={error} redirectTo={redirectTo} />
          </div>

          {!isLogin && (
            <p className="mt-5 text-center text-sm text-neutral-600">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
              >
                Iniciá sesión
              </Link>
            </p>
          )}
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
