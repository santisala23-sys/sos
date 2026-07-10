"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VerifyEmailView() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.emailVerified) {
          router.replace("/dashboard");
          return;
        }
        setEmail(data.email ?? null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = useCallback(
    async (value: string) => {
      if (value.length !== 6 || loading) return;
      setLoading(true);
      setError(null);
      setInfo(null);
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: value }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "No pudimos verificar el código");
          setCode("");
          inputRef.current?.focus();
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("Error de conexión. Probá de nuevo.");
      } finally {
        setLoading(false);
      }
    },
    [loading, router],
  );

  function onCodeChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (error) setError(null);
    if (digits.length === 6) void handleVerify(digits);
  }

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/resend-code", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No pudimos reenviar el código");
        if (typeof data.retryAfter === "number") setCooldown(data.retryAfter);
        return;
      }
      setInfo("Te enviamos un código nuevo. Revisá tu correo.");
      setCooldown(60);
    } catch {
      setError("Error de conexión. Probá de nuevo.");
    } finally {
      setResending(false);
    }
  }

  async function handleUseAnotherAccount() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/register");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <MailCheck className="h-7 w-7" aria-hidden />
        </span>
        <p className="text-sm text-neutral-600">
          Te enviamos un código de 6 dígitos a
        </p>
        <p className="mt-0.5 font-semibold text-neutral-900">
          {email ?? "tu correo"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="verification-code" className="sr-only">
          Código de verificación
        </label>
        <input
          id="verification-code"
          ref={inputRef}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          disabled={loading}
          placeholder="______"
          className="w-full rounded-xl border border-neutral-300 bg-white py-4 text-center font-mono text-3xl font-bold tracking-[0.5em] text-neutral-900 transition-colors placeholder:text-neutral-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-60"
        />
      </div>

      {error && (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {info && !error && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {info}
        </p>
      )}

      <Button
        type="button"
        size="lg"
        disabled={loading || code.length !== 6}
        onClick={() => void handleVerify(code)}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Verificando...
          </span>
        ) : (
          "Verificar y entrar"
        )}
      </Button>

      <div className="flex flex-col items-center gap-1 text-center text-sm">
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={resending || cooldown > 0}
          className="font-semibold text-violet-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-neutral-400 disabled:no-underline"
        >
          {cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : resending
              ? "Reenviando..."
              : "Reenviar código"}
        </button>
        <button
          type="button"
          onClick={() => void handleUseAnotherAccount()}
          className="text-neutral-500 underline-offset-2 hover:text-neutral-700 hover:underline"
        >
          Usar otra cuenta
        </button>
      </div>
    </div>
  );
}
