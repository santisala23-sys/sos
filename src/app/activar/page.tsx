import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { ActivateCodeInput } from "@/components/dashboard/ActivateCodeInput";

export const metadata: Metadata = {
  title: "Activar producto SOSme",
  description:
    "Escaneaste un QR o tenés un código en tu collar, colgante o credencial. Activalo acá una sola vez.",
};

export default function ActivarIndexPage() {
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
            Activá tu producto
          </h1>
          <p className="mt-3 text-neutral-600">
            Compraste un collar, colgante o credencial SOSme. Escaneá el QR o ingresá el
            código una sola vez, registrate y listo: queda vinculado a tu cuenta.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <ActivateCodeInput buttonLabel="Continuar" />
        </div>

        <ol className="mt-8 space-y-3 text-sm text-neutral-600">
          <li>
            <strong className="text-neutral-900">1.</strong> Ingresá el código de la etiqueta.
          </li>
          <li>
            <strong className="text-neutral-900">2.</strong> Creá tu cuenta o iniciá sesión.
          </li>
          <li>
            <strong className="text-neutral-900">3.</strong> Completá el perfil (contacto,
            instrucciones).
          </li>
          <li>
            <strong className="text-neutral-900">4.</strong> Quien escanee después ve tu perfil —
            sin instalar apps.
          </li>
        </ol>

        <p className="mt-8 text-center text-sm text-neutral-500">
          ¿Preferís imprimir el QR vos?{" "}
          <Link href="/register" className="font-medium text-violet-700 hover:underline">
            Creá tu perfil gratis
          </Link>
        </p>
      </main>

      <LegalFooter compact />
    </div>
  );
}
