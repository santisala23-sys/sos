import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createQrProfile, countQrProfilesByTutor, findUserPlanById, listQrProfilesByTutor, setProfileAvatar } from "@/lib/db/queries";
import { getProfileLimitStatus } from "@/lib/billing/limits";
import { generateSlug } from "@/lib/utils/slug";
import { isProfileType, type ProfileType } from "@/lib/profile-types";
import { normalizeBloodType } from "@/lib/blood-types";
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
      profile_type,
      sensitiveDataConsent,
      avatar,
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
      profile_type?: string;
      sensitiveDataConsent?: boolean;
      avatar?: { mime?: string; data?: string } | null;
    };

    if (
      !beneficiary_name ||
      !emergency_contact_name ||
      !emergency_contact_phone ||
      !instructions
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const resolvedProfileType: ProfileType =
      profile_type && isProfileType(profile_type) ? profile_type : "person";

    const resolvedBloodType =
      resolvedProfileType === "person"
        ? normalizeBloodType(blood_type)
        : null;

    const consentError = validateSensitiveDataConsent({
      profileType: resolvedProfileType,
      allergies,
      medicalNotes: medical_notes,
      bloodType: resolvedBloodType,
      sensitiveDataConsent,
    });
    if (consentError) {
      return NextResponse.json({ error: consentError }, { status: 400 });
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
            "Tu plan incluye 1 perfil QR. Para agregar más, contactanos y te ampliamos la cuenta.",
          code: "PROFILE_LIMIT",
          plan: limit,
        },
        { status: 403 },
      );
    }

    const profile = await createQrProfile({
      tutor_id: session.userId,
      slug: generateSlug(beneficiary_name),
      beneficiary_name,
      emergency_contact_name,
      emergency_contact_phone,
      secondary_contact_name: secondary_contact_name?.trim() || null,
      secondary_contact_phone: secondary_contact_phone?.trim() || null,
      instructions,
      medical_notes: medical_notes ?? "",
      allergies: allergies ?? "",
      blood_type: resolvedBloodType,
      profile_type: resolvedProfileType,
      ...sensitiveConsentFields(Boolean(sensitiveDataConsent)),
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
