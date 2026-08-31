import Link from "next/link";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RestablecerContrasenaPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <MarketingBackground>
      <AuthNavbar mode="login" />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Nueva contraseña
            </h1>
            <p className="mt-3 text-base text-neutral-600">
              Elegí una contraseña segura para tu cuenta SOSme.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-8">
            <ResetPasswordForm token={token?.trim() ?? ""} />
          </div>

          <p className="mt-5 text-center text-sm text-neutral-600">
            <Link
              href="/login"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
