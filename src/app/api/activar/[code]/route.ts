import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { withApi } from "@/lib/api/with-api";
import {
  ActivationError,
  findActivationByCode,
  toActivationPublicView,
} from "@/lib/db/queries-activation";
import { isProfileType, type ProfileType } from "@/lib/profile-types";
import { normalizeBloodType } from "@/lib/blood-types";
import {
  sensitiveConsentFields,
  validateSensitiveDataConsent,
} from "@/lib/legal/validate-sensitive";

export const GET = withApi(
  { rateLimit: "api" },
  async (_request, context) => {
    const params = await context.params;
    const code = params?.code ?? "";
    const activation = await findActivationByCode(code);

    if (!activation) {
      return NextResponse.json({ error: "Código no encontrado" }, { status: 404 });
    }

    const session = await getSession();
    return NextResponse.json({
      activation: toActivationPublicView(activation, session?.userId),
    });
  },
);

export const POST = withApi(
  { rateLimit: "auth" },
  async (request, context, meta) => {
    if (!meta.userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const params = await context.params;
    const code = params?.code ?? "";

    let body: {
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

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }

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
    } = body;

    if (
      !beneficiary_name?.trim() ||
      !emergency_contact_name?.trim() ||
      !emergency_contact_phone?.trim() ||
      !instructions?.trim()
    ) {
      return NextResponse.json(
        { error: "Completá nombre, contacto de emergencia e instrucciones" },
        { status: 400 },
      );
    }

    const resolvedProfileType: ProfileType =
      profile_type && isProfileType(profile_type) ? profile_type : "person";

    const resolvedBloodType =
      resolvedProfileType === "person" ? normalizeBloodType(blood_type) : null;

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

    const { claimActivationForUser } = await import("@/lib/db/queries-activation");

    try {
      const result = await claimActivationForUser(code, meta.userId, {
        beneficiary_name: beneficiary_name.trim(),
        emergency_contact_name: emergency_contact_name.trim(),
        emergency_contact_phone: emergency_contact_phone.trim(),
        secondary_contact_name: secondary_contact_name?.trim() || null,
        secondary_contact_phone: secondary_contact_phone?.trim() || null,
        instructions: instructions.trim(),
        medical_notes: medical_notes ?? "",
        allergies: allergies ?? "",
        blood_type: resolvedBloodType,
        profile_type: resolvedProfileType,
        ...sensitiveConsentFields(Boolean(sensitiveDataConsent)),
      });

      return NextResponse.json({
        profile: result.profile,
        activation: toActivationPublicView(result.activation, meta.userId),
      });
    } catch (error) {
      if (error instanceof ActivationError) {
        const status =
          error.code === "NOT_FOUND"
            ? 404
            : error.code === "ALREADY_CLAIMED" || error.code === "RACE"
              ? 409
              : error.code === "DISABLED"
                ? 410
                : 500;
        return NextResponse.json({ error: error.message, code: error.code }, { status });
      }
      console.error("[activar POST]", error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  },
);
