import { AuthForm } from "@/components/auth/AuthForm";
import { AuthNav } from "@/components/auth/AuthNav";
import { LegalFooter } from "@/components/legal/LegalFooter";

type AuthPageShellProps = {
  mode: "login" | "register";
  error?: string | null;
  redirectTo?: string | null;
};

export function AuthPageShell({ mode, error, redirectTo }: AuthPageShellProps) {
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-dvh flex-col bg-[#f8f6fc]">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-200/35 blur-3xl" />
      </div>

      <AuthNav mode={mode} />

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-neutral-900 sm:text-3xl">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {isLogin
                ? "Ingresá a tu panel SOSme"
                : "Gratis con 1 perfil QR incluido"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-lg shadow-violet-500/5 sm:p-7">
            <AuthForm mode={mode} initialError={error} redirectTo={redirectTo} />
          </div>
        </div>
      </main>

      <LegalFooter compact />
    </div>
  );
}
