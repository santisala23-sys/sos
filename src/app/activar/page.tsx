import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { LegalFooter } from "@/components/legal/LegalFooter";
import { ActivateWithCameraHint } from "@/components/activation/ActivateWithCameraHint";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";

export default async function ActivarIndexPage() {
  const session = await getSession();

  return (
    <div className="flex min-h-dvh flex-col bg-[#faf9fc]">
      <header className="border-b border-neutral-200/80 bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo size="sm" />
          </Link>
          <Link href="/#catalogo" className="text-sm font-medium text-violet-700 hover:underline">
            Tienda
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <ActivateWithCameraHint variant={session ? "loggedIn" : "public"} />

        <div className="mt-8 flex flex-wrap gap-3">
          {session ? (
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                Ir al panel
              </Button>
            </Link>
          ) : (
            <>
              <Link href={`/login?redirect=${encodeURIComponent("/activar")}`}>
                <Button>Ya tengo cuenta</Button>
              </Link>
              <Link href={`/register?redirect=${encodeURIComponent("/activar")}`}>
                <Button variant="secondary">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>
      </main>

      <LegalFooter compact />
    </div>
  );
}
