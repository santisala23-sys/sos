"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/Button";

type AuthFormProps = {
  mode: "login" | "register";
  initialError?: string | null;
};

export function AuthForm({ mode, initialError = null }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "register" && !acceptedTerms) {
      setError("Tenés que aceptar los Términos y la Política de Privacidad para continuar");
      return;
    }

    setLoading(true);

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body =
      mode === "register"
        ? { email, password, fullName, acceptedTerms }
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

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
        />
        <span>
          Acepto los{" "}
          <Link href="/terminos" className="font-semibold text-violet-700 underline-offset-2 hover:underline" target="_blank">
            Términos y Condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="font-semibold text-violet-700 underline-offset-2 hover:underline" target="_blank">
            Política de Privacidad
          </Link>{" "}
          de SOSme.
        </span>
      </label>

      {googleEnabled && (
        <GoogleSignInButton disabled={loading || !acceptedTerms} acceptedTerms={acceptedTerms} />
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === "register" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">
              Nombre completo
            </span>
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
        )}

        <label className="flex flex-col gap-1.5">
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

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Contraseña</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "Mín. 8 caracteres, letra y número" : "••••••••"}
          />
        </label>

        {error && (
          <p
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        >
          {loading
            ? "Procesando..."
            : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        {mode === "login" ? (
          <>
            ¿No tenés cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Registrate gratis
            </Link>
          </>
        ) : (
          <>
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-700 underline-offset-2 hover:underline"
            >
              Iniciá sesión
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
