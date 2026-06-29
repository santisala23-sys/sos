"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import type { ProfileType, QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import {
  getProfileTypeConfig,
  PROFILE_TYPES,
} from "@/lib/profile-types";

type QrProfileFormProps = {
  profile?: QrProfile;
  onSuccess: () => void;
  onCancel?: () => void;
};

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("No se pudo leer el archivo"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

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

  const [profileType, setProfileType] = useState<ProfileType>(
    profile?.profile_type ?? "person",
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

  const typeConfig = getProfileTypeConfig(profileType);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      profile_type: profileType,
      beneficiary_name: beneficiaryName,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      secondary_contact_name: secondaryContactName.trim() || null,
      secondary_contact_phone: secondaryContactPhone.trim() || null,
      instructions,
      allergies: typeConfig.showAllergies ? allergies.trim() || null : null,
      medical_notes: typeConfig.showMedicalNotes ? medicalNotes || null : null,
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

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
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

    try {
      const data = await readFileAsBase64(file);
      const res = await fetch(`/api/qr-profiles/${profile.id}/clinical-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, filename: file.name }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        profile?: QrProfile;
      };

      if (!res.ok) {
        setError(json.error ?? "Error al subir el PDF");
        return;
      }

      setClinicalPdfFilename(
        json.profile?.clinical_pdf_filename ?? file.name,
      );
    } catch {
      setError("Error de conexión al subir el PDF. Probá de nuevo.");
    } finally {
      setPdfLoading(false);
      e.target.value = "";
    }
  }

  async function handlePdfDelete() {
    if (!profile) return;
    setPdfLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/qr-profiles/${profile.id}/clinical-pdf`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Error al eliminar el PDF");
        return;
      }

      setClinicalPdfFilename(null);
    } catch {
      setError("Error de conexión al eliminar el PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <fieldset className="rounded-xl border border-neutral-200 p-4">
        <legend className="px-1 text-sm font-semibold text-neutral-800">
          Tipo de perfil *
        </legend>
        <div className="flex flex-col gap-2">
          {PROFILE_TYPES.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                profileType === option.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <input
                type="radio"
                name="profile_type"
                value={option.value}
                checked={profileType === option.value}
                onChange={() => setProfileType(option.value)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold text-neutral-900">
                  {option.label}
                </span>
                <span className="block text-xs text-neutral-500">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{typeConfig.beneficiaryLabel} *</span>
        <input
          required
          value={beneficiaryName}
          onChange={(e) => setBeneficiaryName(e.target.value)}
          className={inputClass}
          placeholder={typeConfig.beneficiaryPlaceholder}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">{typeConfig.contactLabel} *</span>
        <input
          required
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          className={inputClass}
          placeholder={typeConfig.contactPlaceholder}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Teléfono de contacto *</span>
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
          Otro familiar o persona de confianza. También recibe llamada y WhatsApp.
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Nombre</span>
            <input
              value={secondaryContactName}
              onChange={(e) => setSecondaryContactName(e.target.value)}
              className={inputClass}
              placeholder="Ej: Carlos García"
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
          {typeConfig.instructionsLabel} *
        </span>
        <textarea
          required
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className={inputClass}
          placeholder={typeConfig.instructionsPlaceholder}
        />
      </label>

      {typeConfig.showAllergies && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {typeConfig.allergiesLabel} (opcional)
          </span>
          <textarea
            rows={2}
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className={inputClass}
            placeholder={
              profileType === "pet"
                ? "Ej: Alergia al pollo, no puede comer ciertos snacks..."
                : "Ej: Penicilina, maní, látex..."
            }
          />
          {profileType === "person" && (
            <span className="text-xs text-neutral-500">
              Se muestra en rojo y bien visible en la vista de emergencia.
            </span>
          )}
        </label>
      )}

      {typeConfig.showMedicalNotes && (
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {typeConfig.medicalNotesLabel} (opcional)
          </span>
          <textarea
            rows={3}
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            className={inputClass}
            placeholder={typeConfig.medicalNotesPlaceholder}
          />
        </label>
      )}

      {isEditing && typeConfig.showClinicalPdf && (
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
                accept="application/pdf,.pdf"
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

      {!isEditing && typeConfig.showClinicalPdf && (
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
        <Button type="submit" disabled={loading || pdfLoading}>
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
