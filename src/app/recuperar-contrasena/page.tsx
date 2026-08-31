import Link from "next/link";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

export default function RecuperarContrasenaPage() {
  return (
    <MarketingBackground>
      <AuthNavbar mode="login" />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Recuperar contraseña
            </h1>
            <p className="mt-3 text-base text-neutral-600">
              Te enviamos un enlace por email para restablecerla.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-8">
            <ForgotPasswordForm />
          </div>

          <p className="mt-5 text-center text-sm text-neutral-600">
            ¿Recordaste la contraseña?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
