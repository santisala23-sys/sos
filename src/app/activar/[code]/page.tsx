import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Package } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { ActivationClaimView } from "@/components/activation/ActivationClaimView";
import { getSession } from "@/lib/auth/session";
import {
  findActivationByCode,
  toActivationPublicView,
} from "@/lib/db/queries-activation";
import { normalizeActivationCode } from "@/lib/activation/codes";

type ActivarPageProps = {
  params: Promise<{ code: string }>;
};

export async function generateMetadata({
  params,
}: ActivarPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Activar QR ${normalizeActivationCode(code)}`,
    description: "Activá tu código SOSme en el producto que compraste.",
  };
}

export default async function ActivarPage({ params }: ActivarPageProps) {
  const { code: rawCode } = await params;
  const code = normalizeActivationCode(rawCode);
  if (!code) notFound();

  const activationRow = await findActivationByCode(code);
  if (!activationRow) notFound();

  const session = await getSession();
  const activation = toActivationPublicView(activationRow, session?.userId);
  const redirectPath = `/activar/${code}`;

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Link href="/tienda" className="text-sm font-medium text-violet-700 hover:underline">
            Tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="mt-4 text-2xl font-black text-neutral-900 sm:text-3xl">
            Activar producto SOSme
          </h1>
          {(activation.partnerName || activation.productLabel) && (
            <p className="mt-2 text-neutral-600">
              {activation.partnerName}
              {activation.productLabel ? ` · ${activation.productLabel}` : ""}
            </p>
          )}
          <p className="mt-1 font-mono text-sm text-neutral-500">Código {code}</p>
        </div>

        <div className="mt-8">
          <ActivationClaimView
            code={code}
            activation={activation}
            isLoggedIn={Boolean(session)}
            redirectPath={redirectPath}
          />
        </div>
      </main>

      <LegalFooter compact />
    </div>
  );
}
