"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Plus, QrCode } from "lucide-react";
import { ActivateCodeInput } from "@/components/dashboard/ActivateCodeInput";
import { QrProfileForm } from "@/components/dashboard/QrProfileForm";
import { Button } from "@/components/ui/Button";

type OnboardingMode = "choose" | "create" | "activate";

type ProfileOnboardingChoiceProps = {
  onCreateSuccess: () => void;
  initialMode?: OnboardingMode;
};

export function ProfileOnboardingChoice({
  onCreateSuccess,
  initialMode = "choose",
}: ProfileOnboardingChoiceProps) {
  const [mode, setMode] = useState<OnboardingMode>(initialMode);

  if (mode === "create") {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode("choose")}
          className="mb-4 -ml-2 text-neutral-600"
        >
          ← Volver
        </Button>
        <h3 className="text-lg font-bold text-neutral-900">Creá tu QR desde cero</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Para uso personal: persona, mascota u objeto. Incluido 1 perfil en el plan gratis.
        </p>
        <div className="mt-6">
          <QrProfileForm
            onSuccess={() => {
              onCreateSuccess();
              setMode("choose");
            }}
          />
        </div>
      </section>
    );
  }

  if (mode === "activate") {
    return (
      <section className="rounded-2xl border border-violet-200 bg-violet-50/40 p-6 shadow-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode("choose")}
          className="mb-4 -ml-2 text-neutral-600"
        >
          ← Volver
        </Button>
        <h3 className="text-lg font-bold text-neutral-900">
          Activar colgante o código
        </h3>
        <p className="mt-1 text-sm text-neutral-600">
          Si el colegio, una marca o una institución te dio un QR impreso, ingresá el
          código acá para vincularlo a tu cuenta y completar los datos.
        </p>
        <div className="mt-6">
          <ActivateCodeInput buttonLabel="Activar código" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-neutral-900">¿Cómo querés empezar?</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Creá un QR nuevo o activá uno que ya tenés en un colgante, prenda o sticker.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("create")}
          className="rounded-2xl border-2 border-neutral-200 bg-white p-6 text-left shadow-sm transition-all hover:border-violet-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Plus className="h-5 w-5" aria-hidden />
          </span>
          <h4 className="mt-4 font-bold text-neutral-900">Crear QR desde cero</h4>
          <p className="mt-2 text-sm text-neutral-600">
            Uso personal: 1 perfil gratis para persona, mascota u objeto.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setMode("activate")}
          className="rounded-2xl border-2 border-violet-300 bg-violet-50/50 p-6 text-left shadow-sm transition-all hover:border-violet-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Package className="h-5 w-5" aria-hidden />
          </span>
          <h4 className="mt-4 font-bold text-neutral-900">Activar colgante / código</h4>
          <p className="mt-2 text-sm text-neutral-600">
            Colegio, viaje, prenda con QR — vinculá el código a tu cuenta.
          </p>
        </button>
      </div>

      <p className="text-center text-xs text-neutral-500 sm:text-left">
        <QrCode className="mr-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
        ¿Ya escaneaste el QR?{" "}
        <Link href="/productos" className="font-medium text-violet-700 hover:underline">
          Ver cómo funciona en productos
        </Link>
      </p>
    </section>
  );
}
