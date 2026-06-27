"use client";

import { useState } from "react";
import type { QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";

type QrProfileFormProps = {
  profile?: QrProfile;
  onSuccess: () => void;
  onCancel?: () => void;
};

export function QrProfileForm({
  profile,
  onSuccess,
  onCancel,
}: QrProfileFormProps) {
  const isEditing = Boolean(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [beneficiaryName, setBeneficiaryName] = useState(
    profile?.beneficiary_name ?? "",
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile?.emergency_contact_name ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile?.emergency_contact_phone ?? "",
  );
  const [instructions, setInstructions] = useState(profile?.instructions ?? "");
  const [medicalNotes, setMedicalNotes] = useState(profile?.medical_notes ?? "");
  const [isActive, setIsActive] = useState(profile?.is_active ?? true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      beneficiary_name: beneficiaryName,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      instructions,
      medical_notes: medicalNotes || null,
      ...(isEditing ? { is_active: isActive } : {}),
    };

    const res = isEditing
      ? await fetch(`/api/qr-profiles/${profile!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/qr-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al guardar");
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess();
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nombre de la persona *</span>
        <input
          required
          value={beneficiaryName}
          onChange={(e) => setBeneficiaryName(e.target.value)}
          className={inputClass}
          placeholder="Ej: Juan Pérez"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Nombre del contacto de emergencia *</span>
        <input
          required
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          className={inputClass}
          placeholder="Ej: María Pérez (madre)"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Teléfono de emergencia *</span>
        <input
          required
          type="tel"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
          className={inputClass}
          placeholder="+54911..."
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Instrucciones de manejo / comportamiento *
        </span>
        <textarea
          required
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className={inputClass}
          placeholder="Ej: No tolera contacto físico. Hablarle pausado. Sensible a sirenas."
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Notas médicas (opcional)</span>
        <textarea
          rows={3}
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          className={inputClass}
          placeholder="Alergias, medicación, condiciones relevantes..."
        />
      </label>

      {isEditing && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span className="text-sm">Perfil activo (visible al escanear QR)</span>
        </label>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear perfil QR"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
