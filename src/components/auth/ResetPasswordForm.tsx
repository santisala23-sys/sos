"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-base transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No pudimos restablecer la contraseña");
        return;
      }

      setDone(true);
      window.setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          El enlace no es válido. Pedí uno nuevo desde iniciar sesión.
        </p>
        <Link
          href="/recuperar-contrasena"
          className="text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
        >
          Recuperar contraseña
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
          Contraseña actualizada. Te redirigimos a iniciar sesión…
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-violet-700 underline-offset-2 hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-neutral-600">
        Elegí una contraseña nueva para tu cuenta.
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700">
          Nueva contraseña
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoComplete="new-password"
          placeholder="Mín. 8 caracteres, letra y número"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-700">
          Repetir contraseña
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
          autoComplete="new-password"
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
        {loading ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
