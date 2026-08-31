"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  FileDown,
  HelpCircle,
  KeyRound,
  Mail,
  MessageCircle,
  Package,
  PawPrint,
  QrCode,
  Shield,
  Smartphone,
  UserCircle2,
  UserX,
} from "lucide-react";
import type { QrProfile } from "@/types/database";
import type { PlanTier } from "@/lib/billing/plans";
import { PLANS } from "@/lib/billing/plans";
import { formatDateTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";

type AuthMethod = "google" | "email" | "google_and_email";

type AccountData = {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    authMethod: AuthMethod;
    emailVerified: boolean;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletionRequestedAt: string | null;
  };
  legal: {
    needsAcceptance: boolean;
    currentVersion: string;
    userVersion: string | null;
    acceptedAt: string | null;
  };
  plan: {
    planTier: PlanTier;
    planName: string;
    maxProfiles: number;
    currentCount: number;
    activeCount: number;
    canCreateMore: boolean;
    remaining: number;
  };
  pushDeviceCount: number;
};

function authMethodLabel(method: AuthMethod): string {
  switch (method) {
    case "google":
      return "Google";
    case "google_and_email":
      return "Google y contraseña";
    default:
      return "Correo y contraseña";
  }
}

function profileTypeLabel(type: QrProfile["profile_type"], count: number): string {
  const noun =
    type === "pet" ? "Mascota" : type === "object" ? "Objeto" : "Persona";
  return `${count} ${noun}${count === 1 ? "" : type === "pet" ? "s" : "s"}`;
}

function InfoRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="text-sm font-semibold text-neutral-900">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: typeof QrCode;
  label: string;
  value: string | number;
  hint?: string;
  accent: "violet" | "teal" | "amber" | "rose";
}) {
  const styles = {
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
  }[accent];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${styles}`}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="mt-4 text-2xl font-black text-neutral-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-700">{label}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);
  const [profiles, setProfiles] = useState<QrProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [accountMsg, setAccountMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [meRes, profilesRes, logsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/qr-profiles"),
      fetch("/api/scan-logs"),
    ]);

    if (meRes.ok) {
      setAccount(await meRes.json());
    }

    if (profilesRes.ok) {
      const data = await profilesRes.json();
      setProfiles(data.profiles ?? []);
    }

    if (logsRes.ok) {
      const data = await logsRes.json();
      setUnreadCount(data.unreadCount ?? 0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleExport() {
    setExporting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountMsg(data.error ?? "No se pudo exportar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sosme-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setAccountMsg("Exportación generada correctamente.");
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteRequest() {
    const ok = window.confirm(
      "¿Querés solicitar la baja de tu cuenta? Se programará la eliminación/anonimización según la política de retención.",
    );
    if (!ok) return;
    setDeleting(true);
    setAccountMsg(null);
    try {
      const res = await fetch("/api/account/delete-request", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAccountMsg(data.error ?? "No se pudo solicitar la baja");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setAccountMsg("Error de conexión");
    } finally {
      setDeleting(false);
    }
  }

  const petCount = profiles.filter((p) => p.profile_type === "pet").length;
  const personCount = profiles.filter((p) => p.profile_type === "person").length;
  const objectCount = profiles.filter((p) => p.profile_type === "object").length;
  const activeProfiles = profiles.filter((p) => p.is_active).length;
  const displayName =
    account?.user.fullName?.trim() || account?.user.email.split("@")[0] || "Tu cuenta";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const planDescription =
    PLANS[account?.plan.planTier ?? "free"]?.description ?? PLANS.free.description;

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="h-48 animate-pulse rounded-3xl bg-violet-100" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-2xl shadow-violet-600/30 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {account?.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={account.user.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-2xl border-2 border-white/30 object-cover shadow-lg"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/15 text-xl font-black shadow-lg">
                {initials || "?"}
              </span>
            )}
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-violet-100">
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                {account?.user.email}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {account?.user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                    Correo verificado
                  </span>
                ) : (
                  <Link
                    href="/verificar"
                    className="inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-3 py-1 text-xs font-bold text-amber-100 hover:bg-amber-400/35"
                  >
                    Verificar correo
                  </Link>
                )}
                {account?.plan && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
                    Plan {account.plan.planName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard?escanear=1#activar-producto">
              <Button
                type="button"
                className="gap-2 bg-white text-violet-800 hover:bg-violet-50"
              >
                <QrCode className="h-4 w-4" aria-hidden />
                Activar producto
              </Button>
            </Link>
            <Link href="/contacto">
              <Button
                type="button"
                variant="secondary"
                className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Contacto
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {account?.user.deletionRequestedAt && (
        <div
          className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
          role="status"
        >
          <strong>Baja solicitada.</strong> Tu cuenta tiene una solicitud de
          eliminación pendiente desde{" "}
          {formatDateTime(account.user.deletionRequestedAt)}.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={QrCode}
          label="Perfiles QR"
          value={account?.plan.currentCount ?? profiles.length}
          hint={`${activeProfiles} activo${activeProfiles === 1 ? "" : "s"}`}
          accent="violet"
        />
        <StatCard
          icon={Bell}
          label="Alertas sin leer"
          value={unreadCount}
          hint={unreadCount > 0 ? "Revisá Actividad" : "Todo al día"}
          accent="rose"
        />
        <StatCard
          icon={Smartphone}
          label="Dispositivos con alertas"
          value={account?.pushDeviceCount ?? 0}
          hint="Notificaciones push activas"
          accent="teal"
        />
        <StatCard
          icon={Shield}
          label="Capacidad del plan"
          value={`${account?.plan.activeCount ?? activeProfiles}/${account?.plan.maxProfiles ?? 1}`}
          hint={planDescription}
          accent="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-neutral-900">
            <UserCircle2 className="h-5 w-5 text-violet-600" aria-hidden />
            Datos de la cuenta
          </h2>
          <dl className="mt-4">
            <InfoRow label="Nombre" value={account?.user.fullName ?? "Sin nombre"} />
            <InfoRow label="Correo" value={account?.user.email} />
            <InfoRow
              label="Método de acceso"
              value={account ? authMethodLabel(account.user.authMethod) : "—"}
            />
            <InfoRow
              label="Cuenta creada"
              value={
                account?.user.createdAt
                  ? formatDateTime(account.user.createdAt)
                  : "—"
              }
            />
            <InfoRow
              label="Última actualización"
              value={
                account?.user.updatedAt
                  ? formatDateTime(account.user.updatedAt)
                  : "—"
              }
            />
            <InfoRow label="Verificación de correo">
              {account?.user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Verificado
                  {account.user.emailVerifiedAt && (
                    <span className="font-normal text-neutral-500">
                      · {formatDateTime(account.user.emailVerifiedAt)}
                    </span>
                  )}
                </span>
              ) : (
                <Link
                  href="/verificar"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Pendiente — verificar ahora
                </Link>
              )}
            </InfoRow>
          </dl>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-neutral-900">
            <QrCode className="h-5 w-5 text-violet-600" aria-hidden />
            Plan y perfiles
          </h2>
          <dl className="mt-4">
            <InfoRow label="Plan actual" value={account?.plan.planName ?? "Inicial"} />
            <InfoRow
              label="Perfiles en uso"
              value={`${account?.plan.currentCount ?? 0} de ${account?.plan.maxProfiles ?? 1}`}
            />
            <InfoRow
              label="Perfiles activos"
              value={String(account?.plan.activeCount ?? activeProfiles)}
            />
          </dl>
          {(petCount > 0 || personCount > 0 || objectCount > 0) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {petCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                  <PawPrint className="h-3.5 w-3.5" aria-hidden />
                  {profileTypeLabel("pet", petCount)}
                </span>
              )}
              {personCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800">
                  <UserCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {profileTypeLabel("person", personCount)}
                </span>
              )}
              {objectCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
                  <Package className="h-3.5 w-3.5" aria-hidden />
                  {profileTypeLabel("object", objectCount)}
                </span>
              )}
            </div>
          )}
          {profiles.length === 0 && (
            <p className="mt-4 text-sm text-neutral-600">
              Todavía no activaste ningún producto.{" "}
              <Link
                href="/dashboard?escanear=1#activar-producto"
                className="font-semibold text-violet-700 hover:underline"
              >
                Escanear QR
              </Link>
            </p>
          )}
          {(account?.plan.remaining ?? 0) === 0 &&
            account?.plan.maxProfiles === 1 && (
              <p className="mt-4 text-sm text-neutral-600">
                ¿Necesitás más perfiles?{" "}
                <Link
                  href="/contacto"
                  className="font-semibold text-violet-700 hover:underline"
                >
                  Contactanos
                </Link>{" "}
                o comprá otro producto con QR.
              </p>
            )}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-neutral-900">
            <Shield className="h-5 w-5 text-violet-600" aria-hidden />
            Legal y privacidad
          </h2>
          <dl className="mt-4">
            <InfoRow
              label="Términos aceptados"
              value={
                account?.legal.acceptedAt
                  ? formatDateTime(account.legal.acceptedAt)
                  : "Pendiente"
              }
            />
            <InfoRow
              label="Versión de términos"
              value={account?.legal.userVersion ?? "—"}
            />
            <InfoRow label="Estado legal">
              {account?.legal.needsAcceptance ? (
                <Link
                  href="/dashboard"
                  className="font-semibold text-amber-700 hover:underline"
                >
                  Pendiente de aceptar en el panel
                </Link>
              ) : (
                <span className="text-emerald-700">Al día</span>
              )}
            </InfoRow>
          </dl>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/privacidad"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
            >
              Política de privacidad
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link
              href="/retencion-datos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
            >
              Retención de datos
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-neutral-900">
            <KeyRound className="h-5 w-5 text-violet-600" aria-hidden />
            Seguridad y acceso
          </h2>
          <div className="mt-4 space-y-3 text-sm text-neutral-600">
            {account?.user.authMethod === "google" && (
              <p>
                Iniciás sesión con Google. Para cambiar la contraseña de SOSme
                no aplica; tu acceso depende de tu cuenta de Google.
              </p>
            )}
            {account?.user.authMethod === "email" && (
              <p>
                Iniciás sesión con correo y contraseña. Podés restablecer la
                contraseña desde el enlace de recuperación.
              </p>
            )}
            {account?.user.authMethod === "google_and_email" && (
              <p>
                Tu cuenta tiene vinculado Google y también contraseña de SOSme.
              </p>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {account?.user.authMethod !== "google" && (
              <Link href="/recuperar-contrasena">
                <Button type="button" variant="secondary" className="gap-2">
                  <KeyRound className="h-4 w-4" aria-hidden />
                  Cambiar contraseña
                </Button>
              </Link>
            )}
            <Link href="/ayuda">
              <Button type="button" variant="secondary" className="gap-2">
                <HelpCircle className="h-4 w-4" aria-hidden />
                Centro de ayuda
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black text-neutral-900">
          Tus datos y baja de cuenta
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600">
          Podés descargar una copia de toda tu información (perfiles, alertas,
          libretas y suscripciones push) o solicitar la baja de la cuenta según
          nuestra política de retención.
        </p>
        {accountMsg && (
          <p className="mt-4 text-sm text-neutral-700" role="status">
            {accountMsg}
          </p>
        )}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            disabled={exporting}
            onClick={handleExport}
            className="gap-2"
          >
            <FileDown className="h-4 w-4" aria-hidden />
            {exporting ? "Generando..." : "Descargar mis datos (ZIP)"}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={deleting || !!account?.user.deletionRequestedAt}
            onClick={handleDeleteRequest}
            className="gap-2"
          >
            <UserX className="h-4 w-4" aria-hidden />
            {deleting
              ? "Procesando..."
              : account?.user.deletionRequestedAt
                ? "Baja ya solicitada"
                : "Solicitar baja de cuenta"}
          </Button>
        </div>
      </section>
    </main>
  );
}
