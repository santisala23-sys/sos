"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, QrCode } from "lucide-react";
import type { ActivationPublicView } from "@/lib/db/queries-activation";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";

type ActivationClaimViewProps = {
  code: string;
  activation: ActivationPublicView;
  isLoggedIn: boolean;
  redirectPath: string;
};

export function ActivationClaimView({
  code,
  activation,
  isLoggedIn,
  redirectPath,
}: ActivationClaimViewProps) {
  const router = useRouter();

  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(redirectPath)}`;

  if (activation.status === "disabled") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-800">Código no disponible</p>
        <p className="mt-2 text-sm text-red-700">
          Este código fue deshabilitado. Contactá a quien te entregó el producto.
        </p>
      </div>
    );
  }

  if (
    activation.status === "claimed" &&
    (activation.claimedByCurrentUser || !isLoggedIn)
  ) {
    const profileUrl = activation.publicSlug ? `/p/${activation.publicSlug}` : null;
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" aria-hidden />
        <p className="mt-4 font-semibold text-green-900">
          {activation.claimedByCurrentUser
            ? "Este QR ya está activado en tu cuenta"
            : "Este código ya fue activado"}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {activation.claimedByCurrentUser && (
            <Link href="/dashboard">
              <Button>Ir al panel</Button>
            </Link>
          )}
          {profileUrl && (
            <Link href={profileUrl}>
              <Button variant="secondary">Ver perfil público</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (activation.status === "claimed" && isLoggedIn) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-semibold text-amber-900">Código ya en uso</p>
        <p className="mt-2 text-sm text-amber-800">
          Otro usuario activó este QR. Si creés que es un error, contactanos.
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <QrCode className="mt-0.5 h-8 w-8 shrink-0 text-violet-600" aria-hidden />
          <div>
            <p className="font-semibold text-neutral-900">Activá tu producto una sola vez</p>
            <p className="mt-2 text-sm text-neutral-600">
              Creá una cuenta o ingresá para vincular este QR a tu perfil. Después, quien
              escanee ve tus datos de contacto — sin instalar apps.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={registerHref}>
            <Button>Crear cuenta y activar</Button>
          </Link>
          <Link href={loginHref}>
            <Button variant="secondary">Ya tengo cuenta</Button>
          </Link>
        </div>
      </div>
    );
  }

  function handleSuccess(profile?: QrProfile) {
    if (profile?.slug) {
      router.push(`/dashboard?activado=${profile.slug}`);
    } else {
      router.push("/dashboard#perfiles");
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold text-neutral-900">Configurá tu perfil</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Completá los datos que verán quienes escaneen el QR en tu producto.
      </p>

      <div className="mt-6">
        <QrProfileForm
          createEndpoint={`/api/activar/${encodeURIComponent(code)}`}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
