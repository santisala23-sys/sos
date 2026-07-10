"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  FileText,
  HeartPulse,
  Package,
  PawPrint,
  Phone,
  Trash2,
  User,
  Users,
} from "lucide-react";
import type { ProfileType, QrProfile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { AvatarCropper } from "@/components/dashboard/AvatarCropper";
import {
  getProfileTypeConfig,
  PROFILE_TYPES,
} from "@/lib/profile-types";
import { BLOOD_TYPES } from "@/lib/blood-types";
import { profileHasSensitiveData } from "@/lib/legal/sensitive-data";

type QrProfileFormProps = {
  profile?: QrProfile;
  onSuccess: (profile?: QrProfile) => void;
  onCancel?: () => void;
  /** Endpoint usado al crear (no editar). Permite reutilizar el form en la
   *  activación de productos apuntando a /api/activar/[code]. */
  createEndpoint?: string;
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

function dataUrlToAvatarPayload(dataUrl: string): { mime: string; data: string } {
  const semi = dataUrl.indexOf(";");
  const comma = dataUrl.indexOf(",");
  const mime =
    dataUrl.startsWith("data:") && semi > 5
      ? dataUrl.slice(5, semi)
      : "image/jpeg";
  const data = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return { mime, data };
}

export function QrProfileForm({
  profile,
  onSuccess,
  onCancel,
  createEndpoint = "/api/qr-profiles",
}: QrProfileFormProps) {
  const isEditing = Boolean(profile);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clinicalPdfFilename, setClinicalPdfFilename] = useState(
    profile?.clinical_pdf_filename ?? null,
  );

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_b64
      ? `data:${profile.avatar_mime ?? "image/jpeg"};base64,${profile.avatar_b64}`
      : null,
  );
  // undefined = sin cambios; null = quitar; string = nuevo data URL
  const [avatarChange, setAvatarChange] = useState<string | null | undefined>(
    undefined,
  );
  const [cropFile, setCropFile] = useState<File | null>(null);

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
  const [bloodType, setBloodType] = useState(profile?.blood_type ?? "");
  const [medicalNotes, setMedicalNotes] = useState(profile?.medical_notes ?? "");
  const [isActive, setIsActive] = useState(profile?.is_active ?? true);
  const [sensitiveDataConsent, setSensitiveDataConsent] = useState(
    Boolean(profile?.sensitive_data_consent_at),
  );

  const typeConfig = getProfileTypeConfig(profileType);
  const needsSensitiveConsent =
    profileHasSensitiveData({
      profileType,
      allergies,
      medicalNotes,
      bloodType,
      hasClinicalPdf: Boolean(clinicalPdfFilename),
    }) && !profile?.sensitive_data_consent_at;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (needsSensitiveConsent && !sensitiveDataConsent) {
      setError("Para guardar datos médicos necesitás confirmar el consentimiento");
      setLoading(false);
      return;
    }

    const payload = {
      profile_type: profileType,
      beneficiary_name: beneficiaryName,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      secondary_contact_name: secondaryContactName.trim() || null,
      secondary_contact_phone: secondaryContactPhone.trim() || null,
      instructions,
      allergies: typeConfig.showAllergies ? allergies.trim() || null : null,
      blood_type: typeConfig.showBloodType ? bloodType || null : null,
      medical_notes: typeConfig.showMedicalNotes ? medicalNotes || null : null,
      ...(needsSensitiveConsent ? { sensitiveDataConsent } : {}),
      ...(isEditing ? { is_active: isActive } : {}),
      ...(avatarChange !== undefined
        ? {
            avatar:
              avatarChange === null
                ? null
                : dataUrlToAvatarPayload(avatarChange),
          }
        : {}),
    };

    const res = isEditing
      ? await fetch(`/api/qr-profiles/${profile!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(createEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();

    if (!res.ok) {
      if (data.code === "PROFILE_LIMIT") {
        setError(
          data.error ??
            "Llegaste al límite de perfiles. Contactanos para ampliar tu cuenta.",
        );
      } else {
        setError(data.error ?? "Error al guardar");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    onSuccess(data.profile as QrProfile | undefined);
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

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("La foto debe ser una imagen (JPG, PNG o WebP).");
      e.target.value = "";
      return;
    }
    setError(null);
    setCropFile(file);
    e.target.value = "";
  }

  function handleCropConfirm(dataUrl: string) {
    setAvatarPreview(dataUrl);
    setAvatarChange(dataUrl);
    setCropFile(null);
  }

  function handleAvatarRemove() {
    setAvatarPreview(null);
    setAvatarChange(null);
  }

  const AvatarIcon = { person: User, pet: PawPrint, object: Package }[profileType];

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base transition-colors focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200";
  const sectionClass =
    "rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4 sm:p-5";
  const legendClass =
    "flex items-center gap-2 px-1 text-sm font-bold text-neutral-800";

  const typeIcons = {
    person: User,
    pet: PawPrint,
    object: Package,
  } as const;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {cropFile && (
        <AvatarCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-md ring-1 ring-neutral-200">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Foto de perfil"
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarIcon className="h-12 w-12 text-neutral-400" aria-hidden />
            )}
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-md transition-colors hover:bg-violet-700"
            aria-label="Agregar foto de perfil"
          >
            <Camera className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-sm font-semibold text-violet-700 hover:underline"
          >
            {avatarPreview ? "Cambiar foto" : "Agregar foto"}
          </button>
          {avatarPreview && (
            <button
              type="button"
              onClick={handleAvatarRemove}
              className="text-sm font-medium text-neutral-500 hover:text-red-600"
            >
              Quitar
            </button>
          )}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarSelect}
          className="hidden"
        />
      </div>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>Tipo de perfil *</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {PROFILE_TYPES.map((option) => {
            const OptionIcon = typeIcons[option.value];
            const selected = profileType === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer flex-col gap-2 rounded-xl border-2 bg-white p-3 transition-all ${
                  selected
                    ? "border-violet-600 shadow-sm shadow-violet-500/20"
                    : "border-neutral-200 hover:border-violet-300 hover:bg-violet-50/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-violet-600 text-white"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    <OptionIcon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name="profile_type"
                    value={option.value}
                    checked={selected}
                    onChange={() => setProfileType(option.value)}
                    className="sr-only"
                  />
                </div>
                <span className="text-xs leading-snug text-neutral-500">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>
          <Phone className="h-4 w-4 text-violet-600" aria-hidden />
          Contacto principal
        </legend>
        <div className="mt-1 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {typeConfig.beneficiaryLabel} *
            </span>
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
            <PhoneInput
              required
              value={emergencyContactPhone}
              onChange={setEmergencyContactPhone}
              placeholder="11 2233 4455"
            />
            <span className="text-xs text-neutral-500">
              Elegí el país y escribí el número sin el prefijo.
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className={sectionClass}>
        <legend className={legendClass}>
          <Users className="h-4 w-4 text-violet-600" aria-hidden />
          Contacto secundario (opcional)
        </legend>
        <p className="mb-3 mt-1 text-xs text-neutral-500">
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
            <PhoneInput
              value={secondaryContactPhone}
              onChange={setSecondaryContactPhone}
              placeholder="11 2233 4455"
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

      {(typeConfig.showBloodType ||
        typeConfig.showAllergies ||
        typeConfig.showMedicalNotes) && (
        <fieldset className={sectionClass}>
          <legend className={legendClass}>
            <HeartPulse className="h-4 w-4 text-rose-500" aria-hidden />
            Datos médicos (opcional)
          </legend>
          <div className="mt-1 flex flex-col gap-3">
            {typeConfig.showBloodType && (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Tipo de sangre</span>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">No especificado</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-neutral-500">
                  Se muestra destacado en la vista de emergencia para personal de
                  salud.
                </span>
              </label>
            )}

            {typeConfig.showAllergies && (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {typeConfig.allergiesLabel}
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
                  {typeConfig.medicalNotesLabel}
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
          </div>
        </fieldset>
      )}

      {isEditing && typeConfig.showClinicalPdf && (
        <fieldset className={sectionClass}>
          <legend className={legendClass}>
            <FileText className="h-4 w-4 text-violet-600" aria-hidden />
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
                className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline"
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
                className="text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {pdfLoading && (
                <span className="text-xs text-neutral-500">Subiendo PDF...</span>
              )}
            </label>
          )}
        </fieldset>
      )}

      {!isEditing && typeConfig.showClinicalPdf && (
        <p className="rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
          Después de crear el perfil podés subir un PDF con el historial clínico.
        </p>
      )}

      {isEditing && (
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/60 px-4 py-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900">
              Perfil activo
            </span>
            <span className="text-xs text-neutral-500">
              Visible cuando alguien escanea el QR.
            </span>
          </span>
        </label>
      )}

      {needsSensitiveConsent && (
        <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <input
            type="checkbox"
            checked={sensitiveDataConsent}
            onChange={(e) => setSensitiveDataConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-300 text-violet-600 focus:ring-violet-500"
            required
          />
          <span>
            Declaro que tengo legitimación para cargar estos datos de salud, que cuento con el
            consentimiento expreso del titular (o soy el titular), y que entiendo que quien
            escanee el QR podrá ver esta información.{" "}
            <Link
              href="/aviso-datos-sensibles"
              className="font-semibold text-violet-800 underline-offset-2 hover:underline"
              target="_blank"
            >
              Más info
            </Link>
          </span>
        </label>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 -mx-5 mt-1 flex flex-col-reverse gap-2 border-t border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:px-8">
        <Button
          type="submit"
          disabled={loading || pdfLoading}
          className="flex-1 sm:flex-none"
        >
          {loading
            ? "Guardando..."
            : isEditing
              ? "Guardar cambios"
              : "Crear perfil QR"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
