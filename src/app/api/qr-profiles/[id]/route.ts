import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  deleteQrProfile,
  findQrProfileById,
  updateQrProfile,
} from "@/lib/db/queries";
import { normalizeBloodType } from "@/lib/blood-types";
import { isProfileType } from "@/lib/profile-types";
import {
  sensitiveConsentFields,
  validateSensitiveDataConsent,
} from "@/lib/legal/validate-sensitive";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const existing = await findQrProfileById(id);
    if (!existing || existing.tutor_id !== session.userId) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const resolvedType =
      body.profile_type && isProfileType(body.profile_type)
        ? body.profile_type
        : existing.profile_type;

    const patch = {
      ...body,
      ...(body.blood_type !== undefined
        ? {
            blood_type:
              resolvedType === "person"
                ? normalizeBloodType(body.blood_type)
                : null,
          }
        : resolvedType !== "person" && body.profile_type
          ? { blood_type: null }
          : {}),
    };

    const mergedAllergies =
      patch.allergies !== undefined ? patch.allergies : existing.allergies;
    const mergedMedicalNotes =
      patch.medical_notes !== undefined ? patch.medical_notes : existing.medical_notes;
    const mergedBloodType =
      patch.blood_type !== undefined ? patch.blood_type : existing.blood_type;

    const consentError = validateSensitiveDataConsent({
      profileType: resolvedType,
      allergies: mergedAllergies,
      medicalNotes: mergedMedicalNotes,
      bloodType: mergedBloodType,
      hasClinicalPdf: Boolean(existing.clinical_pdf_filename),
      sensitiveDataConsent: body.sensitiveDataConsent,
      alreadyConsented: Boolean(existing.sensitive_data_consent_at),
    });
    if (consentError) {
      return NextResponse.json({ error: consentError }, { status: 400 });
    }

    if (body.sensitiveDataConsent) {
      Object.assign(patch, sensitiveConsentFields(true));
    }

    const profile = await updateQrProfile(id, session.userId, patch);

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
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
  const deleted = await deleteQrProfile(id, session.userId);

  if (!deleted) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
