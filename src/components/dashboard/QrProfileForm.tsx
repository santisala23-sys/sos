"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
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
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalPdfFilename, setClinicalPdfFilename] = useState(
    profile?.clinical_pdf_filename ?? null,
  );

  const [beneficiaryName, setBeneficiaryName] = useState(
    profile?.beneficiary_name ?? "",
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile?.emergency_contact_name ?? "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile?.emergency_contact_phone ?? "",
  );
  const [secondaryContactName, setSecondaryContactName] = useState(
    profile?.secondary_contact_name ?? "",
  );
  const [secondaryContactPhone, setSecondaryContactPhone] = useState(
    profile?.secondary_contact_phone ?? "",
  );
  const [instructions, setInstructions] = useState(profile?.instructions ?? "");
  const [allergies, setAllergies] = useState(profile?.allergies ?? "");
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
      secondary_contact_name: secondaryContactName.trim() || null,
      secondary_contact_phone: secondaryContactPhone.trim() || null,
      instructions,
      allergies: allergies.trim() || null,
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

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El PDF no puede superar 5 MB.");
      e.target.value = "";
      return;
    }

    setPdfLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/qr-profiles/${profile.id}/clinical-pdf`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al subir el PDF");
      setPdfLoading(false);
      e.target.value = "";
      return;
    }

    setClinicalPdfFilename(data.profile?.clinical_pdf_filename ?? file.name);
    setPdfLoading(false);
    e.target.value = "";
  }

  async function handlePdfDelete() {
    if (!profile) return;
    setPdfLoading(true);
    setError(null);

    const res = await fetch(`/api/qr-profiles/${profile.id}/clinical-pdf`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Error al eliminar el PDF");
      setPdfLoading(false);
      return;
    }

    setClinicalPdfFilename(null);
    setPdfLoading(false);
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

      <fieldset className="rounded-xl border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-semibold text-neutral-800">
          Contacto secundario (opcional)
        </legend>
        <p className="mb-3 text-xs text-neutral-500">
          Padre, hermano u otro familiar. También recibe llamada y WhatsApp.
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Nombre</span>
            <input
              value={secondaryContactName}
              onChange={(e) => setSecondaryContactName(e.target.value)}
              className={inputClass}
              placeholder="Ej: Carlos García (padre)"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Teléfono / WhatsApp</span>
            <input
              type="tel"
              value={secondaryContactPhone}
              onChange={(e) => setSecondaryContactPhone(e.target.value)}
              className={inputClass}
              placeholder="+54911..."
            />
          </label>
        </div>
      </fieldset>

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
        <span className="text-sm font-medium">Alergias (opcional)</span>
        <textarea
          rows={2}
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          className={inputClass}
          placeholder="Ej: Penicilina, maní, látex..."
        />
        <span className="text-xs text-neutral-500">
          Se muestra en rojo y bien visible en la vista de emergencia.
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Notas médicas (opcional)</span>
        <textarea
          rows={3}
          value={medicalNotes}
          onChange={(e) => setMedicalNotes(e.target.value)}
          className={inputClass}
          placeholder="Medicación, condiciones, observaciones para el personal de salud..."
        />
      </label>

      {isEditing && (
        <fieldset className="rounded-xl border border-neutral-200 p-4">
          <legend className="px-1 text-sm font-semibold text-neutral-800">
            Historial clínico PDF (opcional)
          </legend>
          <p className="mb-3 text-xs text-neutral-500">
            El médico o quien escanee el QR puede descargarlo si lo necesita.
            Máximo 5 MB.
          </p>
          {clinicalPdfFilename ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`/api/qr-profiles/${profile!.id}/clinical-pdf`}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
              >
                <FileText className="h-4 w-4" aria-hidden />
                {clinicalPdfFilename}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pdfLoading}
                onClick={handlePdfDelete}
                className="gap-1 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                Quitar
              </Button>
            </div>
          ) : (
            <label className="flex flex-col gap-1">
              <input
                type="file"
                accept="application/pdf"
                disabled={pdfLoading}
                onChange={handlePdfUpload}
                className="text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {pdfLoading && (
                <span className="text-xs text-neutral-500">Subiendo PDF...</span>
              )}
            </label>
          )}
        </fieldset>
      )}

      {!isEditing && (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Después de crear el perfil podés subir un PDF con el historial clínico.
        </p>
      )}

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
