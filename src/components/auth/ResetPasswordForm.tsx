"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound } from "lucide-react";
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
    "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

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
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          El enlace no es válido o expiró. Pedí uno nuevo.
        </p>
        <Link
          href="/recuperar-contrasena"
          className="inline-flex w-full items-center justify-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-100"
        >
          Recuperar contraseña
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <div>
          <p className="font-bold text-neutral-900">¡Listo!</p>
          <p className="mt-2 text-sm text-neutral-600">
            Contraseña actualizada. Te redirigimos a iniciar sesión…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-900">
        <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
        <span>Mín. 8 caracteres, con letra y número</span>
      </div>

      <label className="flex flex-col gap-1.5">
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
          placeholder="••••••••"
        />
      </label>

      <label className="flex flex-col gap-1.5">
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
        <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800" role="alert">
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
