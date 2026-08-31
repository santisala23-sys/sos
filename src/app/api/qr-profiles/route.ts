import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createQrProfile, countQrProfilesByTutor, findUserPlanById, generateUniqueProfileSlug, listQrProfilesByTutor, setProfileAvatar } from "@/lib/db/queries";
import { getProfileLimitStatus } from "@/lib/billing/limits";
import { isProfileType, type ProfileType } from "@/lib/profile-types";
import { normalizeBloodType } from "@/lib/blood-types";
import {
  parsePetBirthDate,
  parsePetBreed,
} from "@/lib/pet-weight-validate";
import {
  sensitiveConsentFields,
  validateSensitiveDataConsent,
} from "@/lib/legal/validate-sensitive";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const profiles = await listQrProfilesByTutor(session.userId);
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      beneficiary_name,
      emergency_contact_name,
      emergency_contact_phone,
      secondary_contact_name,
      secondary_contact_phone,
      instructions,
      medical_notes,
      allergies,
      blood_type,
      health_insurance,
      profile_type,
      sensitiveDataConsent,
      avatar,
      pet_breed,
      pet_birth_date,
    } = body as {
      beneficiary_name?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      secondary_contact_name?: string | null;
      secondary_contact_phone?: string | null;
      instructions?: string;
      medical_notes?: string;
      allergies?: string;
      blood_type?: string | null;
      health_insurance?: string | null;
      profile_type?: string;
      sensitiveDataConsent?: boolean;
      avatar?: { mime?: string; data?: string } | null;
      pet_breed?: string | null;
      pet_birth_date?: string | null;
    };

    const resolvedProfileType: ProfileType =
      profile_type && isProfileType(profile_type) ? profile_type : "person";
    const isPet = resolvedProfileType === "pet";

    if (
      !beneficiary_name ||
      !emergency_contact_name ||
      !emergency_contact_phone ||
      (!isPet && !instructions)
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const resolvedBloodType =
      resolvedProfileType === "person"
        ? normalizeBloodType(blood_type)
        : null;

    const consentError = validateSensitiveDataConsent({
      profileType: resolvedProfileType,
      allergies: isPet ? "" : allergies,
      medicalNotes: isPet ? "" : medical_notes,
      bloodType: resolvedBloodType,
      healthInsurance: isPet ? "" : health_insurance,
      sensitiveDataConsent,
    });
    if (consentError) {
      return NextResponse.json({ error: consentError }, { status: 400 });
    }

    let resolvedPetBreed: string | null = null;
    let resolvedPetBirthDate: string | null = null;
    if (isPet) {
      if (pet_breed !== undefined && pet_breed !== null && pet_breed !== "") {
        const breed = parsePetBreed(pet_breed);
        if (typeof breed !== "string") {
          return NextResponse.json({ error: "Raza inválida" }, { status: 400 });
        }
        resolvedPetBreed = breed;
      }
      if (
        pet_birth_date !== undefined &&
        pet_birth_date !== null &&
        pet_birth_date !== ""
      ) {
        const birth = parsePetBirthDate(pet_birth_date);
        if (typeof birth !== "string") {
          return NextResponse.json(
            { error: "Fecha de nacimiento inválida" },
            { status: 400 },
          );
        }
        resolvedPetBirthDate = birth;
      }
    }

    const [plan, profileCount] = await Promise.all([
      findUserPlanById(session.userId),
      countQrProfilesByTutor(session.userId),
    ]);
    const limit = getProfileLimitStatus(
      plan ?? { plan_tier: "free", max_profiles: null },
      profileCount,
    );

    if (!limit.canCreateMore) {
      return NextResponse.json(
        {
          error:
            "Llegaste al límite de perfiles. Contactanos para ampliar tu cuenta.",
          code: "PROFILE_LIMIT",
          plan: limit,
        },
        { status: 403 },
      );
    }

    const profile = await createQrProfile({
      tutor_id: session.userId,
      slug: await generateUniqueProfileSlug(),
      beneficiary_name,
      emergency_contact_name,
      emergency_contact_phone,
      secondary_contact_name: secondary_contact_name?.trim() || null,
      secondary_contact_phone: secondary_contact_phone?.trim() || null,
      instructions: instructions?.trim() || "",
      medical_notes: isPet ? "" : medical_notes ?? "",
      allergies: isPet ? "" : allergies ?? "",
      blood_type: resolvedBloodType,
      health_insurance: isPet ? null : health_insurance?.trim() || null,
      profile_type: resolvedProfileType,
      ...sensitiveConsentFields(Boolean(sensitiveDataConsent)),
      pet_breed: isPet ? resolvedPetBreed : null,
      pet_birth_date: isPet ? resolvedPetBirthDate : null,
    });

    if (avatar?.data && avatar?.mime) {
      try {
        await setProfileAvatar(
          profile.id,
          session.userId,
          avatar.data,
          avatar.mime,
        );
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

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[qr-profiles POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
