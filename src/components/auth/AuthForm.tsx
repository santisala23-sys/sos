"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import {
  GoogleSignInButton,
  startGoogleRegister,
} from "@/components/auth/GoogleSignInButton";
import {
  LegalAcceptanceModal,
  LegalCheckbox,
} from "@/components/auth/LegalAcceptanceModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type AuthFormProps = {
  mode: "login" | "register";
  initialError?: string | null;
  redirectTo?: string | null;
};

function AuthField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        {children}
      </div>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50/80 py-3 pl-10 pr-4 text-base text-neutral-900 shadow-sm transition placeholder:text-neutral-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100";

export function AuthForm({ mode, initialError = null, redirectTo = null }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [declaredEligible, setDeclaredEligible] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalHighlight, setLegalHighlight] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isRegister = mode === "register";
  const registrationReady = acceptedTerms && declaredEligible;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isRegister) {
      if (!declaredEligible) {
        setError(
          "Tenés que confirmar que sos mayor de edad y que contás con legitimación para actuar como tutor responsable",
        );
        return;
      }
      if (!acceptedTerms) {
        setError("Tenés que aceptar los Términos y la Política de Privacidad para continuar");
        return;
      }
    }

    setLoading(true);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister
      ? { email, password, fullName, acceptedTerms, declaredEligible }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al procesar la solicitud");
        return;
      }

      if (data.needsVerification) {
        router.push("/verificar");
        router.refresh();
        return;
      }

      const destination =
        redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function proceedWithGoogle() {
    setGoogleLoading(true);
    try {
      await startGoogleRegister();
    } catch {
      setGoogleLoading(false);
      setError("No se pudo iniciar sesión con Google. Probá de nuevo.");
    }
  }

  async function handleGoogleRegister() {
    if (googleLoading || loading) return;

    if (!registrationReady) {
      setLegalModalOpen(true);
      return;
    }

    await proceedWithGoogle();
  }

  async function handleLegalModalAccept() {
    setLegalModalOpen(false);
    setDeclaredEligible(true);
    setAcceptedTerms(true);
    setLegalHighlight(true);

    window.setTimeout(async () => {
      setLegalHighlight(false);
      await proceedWithGoogle();
    }, 550);
  }

  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  function renderDivider() {
    if (!googleEnabled) return null;
    return (
      <div className="flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
          o con email
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
      </div>
    );
  }

  if (!isRegister) {
    return (
      <div className="flex flex-col gap-4">
        {googleEnabled && <GoogleSignInButton mode="login" disabled={loading} />}
        {renderDivider()}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthField label="Email" icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </AuthField>

          <AuthField label="Contraseña" icon={Lock}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </AuthField>

          <div className="flex justify-end">
            <Link
              href="/recuperar-contrasena"
              className="text-sm font-semibold text-violet-700 transition hover:text-violet-900 hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </div>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {googleEnabled && (
          <GoogleSignInButton
            mode="register"
            disabled={loading || googleLoading}
            onRegisterClick={handleGoogleRegister}
          />
        )}
        {renderDivider()}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3 text-sm text-violet-900">
            Después del registro{" "}
            <strong>escaneá el QR</strong> de tu producto desde el panel.
          </div>

          <AuthField label="Nombre completo" icon={User}>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              placeholder="Ej: María García"
            />
          </AuthField>

          <AuthField label="Email" icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </AuthField>

          <AuthField label="Contraseña" icon={Lock}>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres, letra y número"
            />
          </AuthField>

          <fieldset
            className={cn(
              "flex flex-col gap-3 rounded-2xl border bg-neutral-50/80 p-4 transition-all duration-500",
              legalHighlight
                ? "border-violet-400 shadow-md shadow-violet-500/10"
                : "border-neutral-200",
            )}
          >
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-neutral-700">
              Confirmaciones
            </legend>

            <LegalCheckbox
              checked={declaredEligible}
              onChange={setDeclaredEligible}
              highlight={legalHighlight}
            >
              Declaro ser <strong>mayor de 18 años</strong> y contar con legitimación para usar
              SOSme como tutor responsable (titular, padre/madre/tutor legal, dueño o responsable
              del beneficiario al cargar datos de terceros, incluidos menores).
            </LegalCheckbox>

            <LegalCheckbox
              checked={acceptedTerms}
              onChange={setAcceptedTerms}
              highlight={legalHighlight}
            >
              Acepto los{" "}
              <Link
                href="/terminos"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
                target="_blank"
              >
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                className="font-semibold text-violet-700 underline-offset-2 hover:underline"
                target="_blank"
              >
                Política de Privacidad
              </Link>{" "}
              de SOSme.
            </LegalCheckbox>
          </fieldset>

          {error && (
            <p
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading || googleLoading || !registrationReady}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        </form>
      </div>

      <LegalAcceptanceModal
        open={legalModalOpen}
        onAccept={handleLegalModalAccept}
        onCancel={() => setLegalModalOpen(false)}
      />
    </>
  );
}
