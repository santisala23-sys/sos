"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, QrCode } from "lucide-react";
import type {
  ActivationPublicView,
  UnlinkedProfileOption,
} from "@/lib/db/queries-activation";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { getActivationTypeCopy } from "@/lib/profile-types";
import { dashboardHashForProfileType } from "@/lib/dashboard/profile-section-order";

type ActivationClaimViewProps = {
  code: string;
  activation: ActivationPublicView;
  isLoggedIn: boolean;
  redirectPath: string;
  linkableProfiles?: UnlinkedProfileOption[];
};

export function ActivationClaimView({
  code,
  activation,
  isLoggedIn,
  redirectPath,
  linkableProfiles = [],
}: ActivationClaimViewProps) {
  const router = useRouter();
  const copy = getActivationTypeCopy(activation.profileType);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const loginHref = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  const registerHref = `/register?redirect=${encodeURIComponent(redirectPath)}`;

  function goToDashboard(profile?: QrProfile) {
    const type = profile?.profile_type ?? activation.profileType;
    const hash = dashboardHashForProfileType(type);
    if (profile?.slug) {
      router.push(`/dashboard?activado=${profile.slug}${hash}`);
    } else {
      router.push(`/dashboard${hash}`);
    }
    router.refresh();
  }

  async function handleLink(profileId: string) {
    if (linkingId) return;
    setLinkError(null);
    setLinkingId(profileId);
    try {
      const res = await fetch(`/api/activar/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link_profile_id: profileId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        profile?: QrProfile;
      };
      if (!res.ok) {
        setLinkError(data.error ?? "No se pudo vincular el perfil");
        return;
      }
      goToDashboard(data.profile);
    } catch {
      setLinkError("No se pudo vincular el perfil. Probá de nuevo.");
    } finally {
      setLinkingId(null);
    }
  }

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
            <p className="font-semibold text-neutral-900">{copy.loginTitle}</p>
            <p className="mt-2 text-sm text-neutral-600">{copy.loginBody}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={loginHref}>
            <Button>Ya tengo cuenta</Button>
          </Link>
          <Link href={registerHref}>
            <Button variant="secondary">Crear cuenta y activar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {linkableProfiles.length > 0 && (
        <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-neutral-900">
            ¿Ya lo tenés cargado?
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Este QR del producto se puede atar a un perfil que ya existe. Así no
            se crea otro código.
          </p>
          <ul className="mt-5 space-y-3">
            {linkableProfiles.map((profile) => (
              <li key={profile.id}>
                <button
                  type="button"
                  disabled={Boolean(linkingId)}
                  onClick={() => void handleLink(profile.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                >
                  <span>
                    <span className="block font-bold text-neutral-900">
                      {profile.beneficiary_name}
                    </span>
                    <span className="mt-0.5 block text-sm text-neutral-500">
                      Vincular este producto
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-violet-700">
                    {linkingId === profile.id ? "Vinculando…" : "Usar este"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {linkError && (
            <p className="mt-3 text-sm font-medium text-red-700" role="alert">
              {linkError}
            </p>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold text-neutral-900">
          {linkableProfiles.length > 0
            ? "O crear un perfil nuevo"
            : copy.formTitle}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          {linkableProfiles.length > 0
            ? "Solo si este producto es de otra mascota, persona u objeto."
            : copy.formHint}
        </p>

        <div className="mt-6">
          <QrProfileForm
            createEndpoint={`/api/activar/${encodeURIComponent(code)}`}
            defaultProfileType={activation.profileType}
            lockProfileType
            onSuccess={goToDashboard}
          />
        </div>
      </div>
    </div>
  );
}
