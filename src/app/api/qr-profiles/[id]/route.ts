import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import {
  clearProfileAvatar,
  deleteQrProfile,
  findQrProfileById,
  setProfileAvatar,
  updateQrProfile,
  updateQrProfileById,
} from "@/lib/db/queries";
import {
  canAccessProfileDashboard,
  canDeleteProfile,
  canEditProfile,
} from "@/lib/profile-access";
import { normalizeBloodType } from "@/lib/blood-types";
import { isProfileType } from "@/lib/profile-types";
import {
  parsePetBirthDate,
  parsePetBreed,
} from "@/lib/pet-weight-validate";
import {
  sensitiveConsentFields,
  validateSensitiveDataConsent,
} from "@/lib/legal/validate-sensitive";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canAccessProfileDashboard(access)) {
    return accessDenied("No tenés permiso para ver este perfil");
  }

  return NextResponse.json({
    profile: access.profile,
    access: access.kind,
    share: access.kind === "shared" ? access.share : null,
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const access = await requireProfileAccess(id, session.userId);
    if (access instanceof NextResponse) return access;
    if (!canEditProfile(access)) {
      return accessDenied("No tenés permiso para editar este perfil");
    }
    const existing = access.profile;

    // Tutores no pueden cambiar nombre ni tipo una vez creado el perfil.
    if (
      body.profile_type !== undefined &&
      isProfileType(body.profile_type) &&
      body.profile_type !== existing.profile_type
    ) {
      return NextResponse.json(
        { error: "No podés cambiar el tipo de perfil" },
        { status: 403 },
      );
    }
    if (
      body.beneficiary_name !== undefined &&
      String(body.beneficiary_name).trim() !== existing.beneficiary_name
    ) {
      return NextResponse.json(
        { error: "No podés cambiar el nombre del perfil" },
        { status: 403 },
      );
    }

    const resolvedType = existing.profile_type;

    const {
      profile_type: _ignoredType,
      beneficiary_name: _ignoredName,
      ...bodyWithoutImmutable
    } = body;

    const patch = {
      ...bodyWithoutImmutable,
      ...(body.blood_type !== undefined
        ? {
            blood_type:
              resolvedType === "person"
                ? normalizeBloodType(body.blood_type)
                : null,
          }
        : {}),
    };

    const mergedAllergies =
      patch.allergies !== undefined ? patch.allergies : existing.allergies;
    const mergedMedicalNotes =
      patch.medical_notes !== undefined ? patch.medical_notes : existing.medical_notes;
    const mergedBloodType =
      patch.blood_type !== undefined ? patch.blood_type : existing.blood_type;
    const mergedHealthInsurance =
      patch.health_insurance !== undefined
        ? patch.health_insurance
        : existing.health_insurance;

    const consentError = validateSensitiveDataConsent({
      profileType: resolvedType,
      allergies: mergedAllergies,
      medicalNotes: mergedMedicalNotes,
      bloodType: mergedBloodType,
      healthInsurance: mergedHealthInsurance,
      sensitiveDataConsent: body.sensitiveDataConsent,
      alreadyConsented: Boolean(existing.sensitive_data_consent_at),
    });
    if (consentError) {
      return NextResponse.json({ error: consentError }, { status: 400 });
    }

    if (body.sensitiveDataConsent) {
      Object.assign(patch, sensitiveConsentFields(true));
    }

    if (resolvedType === "pet") {
      patch.health_insurance = null;
      patch.allergies = null;
      patch.medical_notes = null;
      patch.blood_type = null;
    } else if (resolvedType === "object") {
      patch.health_insurance = null;
      patch.allergies = null;
      patch.medical_notes = null;
      patch.blood_type = null;
    }

    if (body.pet_breed !== undefined || body.pet_birth_date !== undefined) {
      if (resolvedType !== "pet") {
        return NextResponse.json(
          { error: "Raza y fecha de nacimiento solo aplican a mascotas" },
          { status: 400 },
        );
      }
      if (body.pet_breed !== undefined) {
        const breed = parsePetBreed(body.pet_breed);
        if (breed === null && body.pet_breed !== null && body.pet_breed !== "") {
          return NextResponse.json({ error: "Raza inválida" }, { status: 400 });
        }
        patch.pet_breed = breed ?? null;
      }
      if (body.pet_birth_date !== undefined) {
        const birth = parsePetBirthDate(body.pet_birth_date);
        if (
          birth === null &&
          body.pet_birth_date !== null &&
          body.pet_birth_date !== ""
        ) {
          return NextResponse.json(
            { error: "Fecha de nacimiento inválida" },
            { status: 400 },
          );
        }
        patch.pet_birth_date = birth ?? null;
      }
    }

    const profile =
      access.kind === "owner"
        ? await updateQrProfile(id, session.userId, patch)
        : await updateQrProfileById(id, patch);

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const avatar = body.avatar as { mime?: string; data?: string } | null | undefined;
    if (avatar === null) {
      if (access.kind === "owner") {
        await clearProfileAvatar(id, session.userId);
      }
    } else if (avatar?.data && avatar?.mime) {
      try {
        if (access.kind === "owner") {
          await setProfileAvatar(id, session.userId, avatar.data, avatar.mime);
        }
      } catch (avatarError) {
        return NextResponse.json(
          {
            error:
              avatarError instanceof Error
                ? avatarError.message
                : "No se pudo guardar la foto de perfil",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[qr-profiles PATCH]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canDeleteProfile(access)) {
    return accessDenied("Solo el titular puede eliminar el perfil");
  }

  const deleted = await deleteQrProfile(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
