"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleSignInButton,
  startGoogleRegister,
} from "@/components/auth/GoogleSignInButton";
import {
  LegalAcceptanceModal,
  LegalCheckbox,
} from "@/components/auth/LegalAcceptanceModal";
import { Button } from "@/components/ui/Button";

type AuthFormProps = {
  mode: "login" | "register";
  initialError?: string | null;
  redirectTo?: string | null;
};

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

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-base transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

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

  if (!isRegister) {
    return (
      <div className="flex flex-col gap-3">
        {googleEnabled && <GoogleSignInButton mode="login" disabled={loading} />}

        {googleEnabled && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              o con email
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? "Procesando..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {googleEnabled && (
          <GoogleSignInButton
            mode="register"
            disabled={loading || googleLoading}
            onRegisterClick={handleGoogleRegister}
          />
        )}

        {googleEnabled && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              o con email
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="rounded-lg border border-violet-100 bg-violet-50/80 px-3 py-2 text-xs text-violet-900">
            <strong>Plan gratis:</strong> 1 perfil QR.{" "}
            <Link href="/contacto" className="font-semibold underline-offset-2 hover:underline">
              Más perfiles
            </Link>
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700">Nombre completo</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
              autoComplete="name"
              placeholder="Ej: María García"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-neutral-700">Contraseña</span>
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
          </label>

          <fieldset
            className={`flex flex-col gap-2 rounded-xl border bg-neutral-50/80 p-3 transition-all duration-500 ${
              legalHighlight
                ? "border-violet-400 shadow-md shadow-violet-500/10"
                : "border-neutral-200"
            }`}
          >
            <legend className="px-1 text-xs font-semibold text-neutral-800">
              Confirmaciones finales
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
              <Link href="/terminos" className="font-semibold text-violet-700 underline-offset-2 hover:underline" target="_blank">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="font-semibold text-violet-700 underline-offset-2 hover:underline" target="_blank">
                Política de Privacidad
              </Link>{" "}
              de SOSme.
            </LegalCheckbox>
          </fieldset>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading || googleLoading || !registrationReady}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? "Procesando..." : "Crear cuenta"}
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
