import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createQrProfile, listQrProfilesByTutor } from "@/lib/db/queries";
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

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[qr-profiles POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
