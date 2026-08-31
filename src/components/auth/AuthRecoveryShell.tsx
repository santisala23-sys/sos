import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AuthNavbar } from "@/components/auth/AuthNavbar";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { MarketingBackground } from "@/components/marketing/MarketingBackground";

type AuthRecoveryShellProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthRecoveryShell({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthRecoveryShellProps) {
  return (
    <MarketingBackground>
      <AuthNavbar mode="login" />

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/90 px-4 py-1.5 text-sm font-semibold text-violet-800 shadow-sm">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-neutral-600">
              {description}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/90 bg-white/95 p-6 shadow-2xl shadow-violet-500/15 backdrop-blur-sm sm:p-8">
            {children}
          </div>

          {footer ?? (
            <p className="mt-6 text-center text-sm text-neutral-600">
              <Link
                href="/login"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </p>
          )}
        </div>
      </main>

      <LegalFooter compact />
    </MarketingBackground>
  );
}
