"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  HeartPulse,
  Package,
  PawPrint,
  Phone,
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
  defaultProfileType?: ProfileType;
  /** Si es true, no se puede cambiar el tipo (p. ej. lote de chapitas de mascota). En edición siempre queda bloqueado. */
  lockProfileType?: boolean;
  onSuccess: (profile?: QrProfile) => void;
  onCancel?: () => void;
  /** Endpoint usado al crear (no editar). Permite reutilizar el form en la
   *  activación de productos apuntando a /api/activar/[code]. */
  createEndpoint?: string;
};

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
  defaultProfileType,
  lockProfileType = false,
  onSuccess,
  onCancel,
  createEndpoint = "/api/qr-profiles",
}: QrProfileFormProps) {
  const isEditing = Boolean(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    profile?.profile_type ?? defaultProfileType ?? "person",
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
  const [healthInsurance, setHealthInsurance] = useState(
    profile?.health_insurance ?? "",
  );
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
      healthInsurance,
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
      ...(isEditing
        ? {}
        : {
            profile_type: profileType,
            beneficiary_name: beneficiaryName,
          }),
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      secondary_contact_name: secondaryContactName.trim() || null,
      secondary_contact_phone: secondaryContactPhone.trim() || null,
      instructions: instructions.trim(),
      ...(typeConfig.showAllergies
        ? { allergies: allergies.trim() || null }
        : isEditing
          ? {}
          : { allergies: null }),
      ...(typeConfig.showBloodType
        ? { blood_type: bloodType || null }
        : isEditing
          ? {}
          : { blood_type: null }),
      ...(typeConfig.showMedicalNotes
        ? { medical_notes: medicalNotes || null }
        : isEditing
          ? {}
          : { medical_notes: null }),
      ...(typeConfig.showHealthInsurance
        ? { health_insurance: healthInsurance.trim() || null }
        : isEditing
          ? {}
          : { health_insurance: null }),
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

      {lockProfileType || isEditing ? (
        <div className={`${sectionClass} flex items-start gap-3`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
            <AvatarIcon className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-neutral-900">
              {PROFILE_TYPES.find((option) => option.value === profileType)?.label}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-neutral-500">
              {
                PROFILE_TYPES.find((option) => option.value === profileType)
                  ?.description
              }
            </p>
            {isEditing && (
              <p className="mt-1 text-xs text-neutral-500">
                El tipo de perfil no se puede cambiar.
              </p>
            )}
          </div>
        </div>
      ) : (
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
      )}

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
              readOnly={isEditing}
              className={`${inputClass}${isEditing ? " cursor-not-allowed bg-neutral-100 text-neutral-600" : ""}`}
              placeholder={typeConfig.beneficiaryPlaceholder}
            />
            {isEditing && (
              <span className="text-xs text-neutral-500">
                El nombre no se puede cambiar.
              </span>
            )}
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
          {typeConfig.instructionsLabel}
          {typeConfig.instructionsRequired ? " *" : " (opcional)"}
        </span>
        <textarea
          required={typeConfig.instructionsRequired}
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className={inputClass}
          placeholder={typeConfig.instructionsPlaceholder}
        />
      </label>

      {(typeConfig.showBloodType ||
        typeConfig.showAllergies ||
        typeConfig.showMedicalNotes ||
        typeConfig.showHealthInsurance) && (
        <fieldset className={sectionClass}>
          <legend className={legendClass}>
            <HeartPulse className="h-4 w-4 text-rose-500" aria-hidden />
            {profileType === "person" ? "Datos de salud (opcional)" : "Datos médicos (opcional)"}
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

            {typeConfig.showHealthInsurance && (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {typeConfig.healthInsuranceLabel}
                </span>
                <input
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(e.target.value)}
                  className={inputClass}
                  placeholder={typeConfig.healthInsurancePlaceholder}
                  maxLength={200}
                />
                <span className="text-xs text-neutral-500">
                  Se muestra en la vista de emergencia para personal de salud.
                </span>
              </label>
            )}
          </div>
        </fieldset>
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
          disabled={loading}
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
