"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { normalizeActivationCode } from "@/lib/activation/codes";
import { Button } from "@/components/ui/Button";

type ActivateCodeInputProps = {
  className?: string;
  buttonLabel?: string;
};

export function ActivateCodeInput({
  className,
  buttonLabel = "Continuar",
}: ActivateCodeInputProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeActivationCode(code);
    if (!normalized) {
      setError("Ingresá un código válido (letras y números).");
      return;
    }
    setError(null);
    router.push(`/activar/${normalized}`);
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label className="block text-sm font-medium text-neutral-700">
        Código del colgante o etiqueta
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Ej. A7K9M2XP"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 font-mono text-base tracking-wider focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
      </label>
      <p className="mt-2 text-xs text-neutral-500">
        Está impreso en la tarjeta, colgante o sticker que te entregaron.
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="mt-4 w-full gap-2 sm:w-auto">
        {buttonLabel}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </form>
  );
}
