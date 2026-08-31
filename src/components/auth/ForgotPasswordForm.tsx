"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-base transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No pudimos procesar el pedido");
        return;
      }

      setSent(true);
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-xl bg-violet-50 px-4 py-3 text-sm leading-relaxed text-violet-900">
          Si existe una cuenta con <strong>{email}</strong>, te enviamos un email
          con un enlace para restablecer tu contraseña. Revisá también spam.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-neutral-600">
        Ingresá el email de tu cuenta y te mandamos un enlace para elegir una
        contraseña nueva.
      </p>

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
        {loading ? "Enviando..." : "Enviar enlace"}
      </Button>

      <Link
        href="/login"
        className="text-center text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
      >
        Volver a iniciar sesión
      </Link>
    </form>
  );
}
