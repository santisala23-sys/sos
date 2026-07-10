import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { VerifyEmailView } from "@/components/auth/VerifyEmailView";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

export const metadata: Metadata = {
  title: "Verificá tu email",
  description: "Confirmá tu correo para activar tu cuenta de SOSme.",
};

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <MarketingBackground>
      <AuthNavbar mode="login" />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-600" aria-hidden />
              Último paso
            </p>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              Verificá tu{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                email
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-neutral-600">
              Confirmá tu correo con el código que te enviamos para activar tu
              cuenta.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-8">
            <VerifyEmailView />
          </div>
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
