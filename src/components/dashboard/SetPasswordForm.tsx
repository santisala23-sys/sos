"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SetPasswordFormProps = {
  onSuccess?: () => void;
};

export function SetPasswordForm({ onSuccess }: SetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/account/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la contraseña");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(data.message ?? "Contraseña creada correctamente.");
      onSuccess?.();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-4 sm:p-5"
    >
      <p className="text-sm leading-relaxed text-neutral-700">
        Creá una contraseña para tu cuenta SOSme. Después vas a poder elegir:
        entrar con <strong>Google</strong> o con tu <strong>correo y contraseña</strong>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-1">
          <span className="text-sm font-medium text-neutral-700">Nueva contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>
        <label className="flex flex-col gap-1 sm:col-span-1">
          <span className="text-sm font-medium text-neutral-700">Confirmar contraseña</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            className="rounded-xl border border-neutral-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </label>
      </div>

      <p className="mt-2 text-xs text-neutral-500">
        Mínimo 8 caracteres, con letras y números.
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-3 text-sm font-medium text-emerald-700" role="status">
          {success}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-4 gap-2">
        <KeyRound className="h-4 w-4" aria-hidden />
        {loading ? "Guardando..." : "Crear contraseña"}
      </Button>
    </form>
  );
}
