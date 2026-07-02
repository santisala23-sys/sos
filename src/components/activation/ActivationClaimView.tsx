"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, QrCode } from "lucide-react";
import type { ActivationPublicView } from "@/lib/db/queries-activation";
import { Button } from "@/components/ui/Button";
import { PROFILE_TYPES } from "@/lib/profile-types";

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
  const [beneficiaryName, setBeneficiaryName] = useState(
    activation.productLabel ?? "",
  );
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [instructions, setInstructions] = useState(
    "Si encontrás este producto o necesitás contactar al dueño, usá los datos de arriba.",
  );
  const [profileType, setProfileType] = useState("person");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <p className="font-semibold text-neutral-900">Activá tu QR de producto</p>
            <p className="mt-2 text-sm text-neutral-600">
              Creá una cuenta gratis o ingresá para vincular este código. La activación
              de producto no cuenta contra el límite de perfiles manuales.
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

  async function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/activar/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiary_name: beneficiaryName,
          emergency_contact_name: contactName,
          emergency_contact_phone: contactPhone,
          instructions,
          profile_type: profileType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo activar el código");
        return;
      }

      router.push(`/dashboard?activado=${data.profile.slug}`);
      router.refresh();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleClaim}
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-lg font-bold text-neutral-900">Configurá tu perfil</h2>
      <p className="mt-1 text-sm text-neutral-600">
        Completá los datos que verán quienes escaneen el QR en tu producto.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-neutral-700">
          Tipo de perfil
          <select
            value={profileType}
            onChange={(e) => setProfileType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {PROFILE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Nombre o identificación
          <input
            required
            value={beneficiaryName}
            onChange={(e) => setBeneficiaryName(e.target.value)}
            placeholder="Ej. Chaqueta de Juan, Collar de Firu"
            className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Contacto de emergencia
          <input
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Nombre del contacto"
            className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Teléfono / WhatsApp
          <input
            required
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+54 9 11 ..."
            className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>

        <label className="block text-sm font-medium text-neutral-700">
          Instrucciones para quien escanea
          <textarea
            required
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full gap-2" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Activando...
          </>
        ) : (
          "Activar QR"
        )}
      </Button>
    </form>
  );
}
