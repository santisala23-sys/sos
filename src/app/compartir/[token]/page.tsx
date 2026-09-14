"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Share2, UserPlus } from "lucide-react";
import type { ProfileSharePermissions } from "@/types/database";
import { Button } from "@/components/ui/Button";
import {
  formatShareExpiryLabel,
  formatSharePermissionsList,
} from "@/lib/email/profile-share-email";
import { PROFILE_TYPES } from "@/lib/profile-types";

type InvitePreview = {
  profileName: string;
  profileType: string;
  ownerName: string | null;
  ownerEmail: string;
  permissions: ProfileSharePermissions;
  shareExpiresAt: string | null;
  inviteExpiresAt: string;
  redeemed: boolean;
  active: boolean;
};

export default function AcceptProfileSharePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(true);

  const redirectPath = `/compartir/${params.token}`;

  useEffect(() => {
    async function load() {
      const [inviteRes, meRes] = await Promise.all([
        fetch(`/api/profile-share-invites/${params.token}`),
        fetch("/api/auth/me"),
      ]);
      const data = await inviteRes.json();
      if (!inviteRes.ok) {
        setError(data.error ?? "Invitación no encontrada");
        setLoading(false);
        return;
      }
      setPreview(data as InvitePreview);
      setNeedsLogin(!meRes.ok);
      setLoading(false);
    }
    void load();
  }, [params.token]);

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile-share-invites/${params.token}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "No se pudo aceptar la invitación");
        return;
      }
      setAccepted(true);
      window.setTimeout(() => router.push("/dashboard"), 2000);
    } catch {
      setError("Error de conexión");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  if (error && !preview) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-black text-neutral-900">Invitación no disponible</h1>
        <p className="mt-2 text-neutral-600">{error}</p>
        <Link href="/login" className="mt-6 inline-block text-violet-700 font-semibold hover:underline">
          Ir a SOSme
        </Link>
      </main>
    );
  }

  if (!preview) return null;

  const ownerLabel = preview.ownerName?.trim() || preview.ownerEmail.split("@")[0];
  const typeLabel =
    PROFILE_TYPES.find((item) => item.value === preview.profileType)?.label ?? "Perfil";
  const permissionLines = formatSharePermissionsList(preview.permissions);

  if (accepted) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-black text-neutral-900">¡Listo!</h1>
        <p className="mt-2 text-neutral-600">
          Ya tenés acceso a <strong>{preview.profileName}</strong> en Compartidos conmigo.
        </p>
      </main>
    );
  }

  const inactive = !preview.active || preview.redeemed;

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:py-16">
      <div className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-500/10">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-800 px-6 py-8 text-white sm:px-8">
          <div className="flex items-center gap-3">
            <Share2 className="h-8 w-8" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-violet-100">Invitación de co-tutoría</p>
              <h1 className="text-2xl font-black tracking-tight">{preview.profileName}</h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-violet-100">
            <strong>{ownerLabel}</strong> te invita a colaborar con este {typeLabel.toLowerCase()}{" "}
            en SOSme.
          </p>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-8">
          {inactive ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              {preview.redeemed
                ? "Esta invitación ya fue usada."
                : "Esta invitación venció. Pedile a la persona que te comparta un link nuevo."}
            </p>
          ) : (
            <>
              <div>
                <p className="text-sm font-bold text-neutral-900">Permisos incluidos</p>
                <ul className="mt-2 space-y-1 text-sm text-neutral-700">
                  {permissionLines.map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-neutral-600">
                {formatShareExpiryLabel(preview.shareExpiresAt)}
              </p>
            </>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {!inactive && (
            <>
              {needsLogin ? (
                <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                  <p className="text-sm text-neutral-700">
                    Para aceptar, necesitás una cuenta SOSme (es gratis).
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href={`/register?redirect=${encodeURIComponent(redirectPath)}`} className="flex-1">
                      <Button type="button" className="w-full gap-2">
                        <UserPlus className="h-4 w-4" />
                        Crear cuenta
                      </Button>
                    </Link>
                    <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} className="flex-1">
                      <Button type="button" variant="secondary" className="w-full">
                        Ya tengo cuenta
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  className="w-full gap-2"
                  disabled={accepting}
                  onClick={() => void handleAccept()}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {accepting ? "Aceptando..." : "Aceptar invitación"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
