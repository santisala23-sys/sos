import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  adminDeleteQrProfile,
  adminUpdateQrProfile,
  findAdminProfileById,
} from "@/lib/db/queries";
import { normalizeBloodType } from "@/lib/blood-types";
import { isProfileType } from "@/lib/profile-types";
import { logSecurityAudit } from "@/lib/security/audit";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context) => {
    const { id } = await (context.params as RouteContext["params"]);
    const profile = await findAdminProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ profile });
  },
);

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const body = await request.json();

    const existing = await findAdminProfileById(id);
    if (!existing) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    const resolvedType =
      body.profile_type && isProfileType(body.profile_type)
        ? body.profile_type
        : existing.profile_type;

    const patch = {
      beneficiary_name: body.beneficiary_name,
      profile_type: body.profile_type,
      emergency_contact_name: body.emergency_contact_name,
      emergency_contact_phone: body.emergency_contact_phone,
      secondary_contact_name: body.secondary_contact_name,
      secondary_contact_phone: body.secondary_contact_phone,
      instructions: body.instructions,
      medical_notes: body.medical_notes,
      allergies: body.allergies,
      is_active: body.is_active,
      ...(body.blood_type !== undefined
        ? {
            blood_type:
              resolvedType === "person"
                ? normalizeBloodType(body.blood_type)
                : null,
          }
        : {}),
    };

    const profile = await adminUpdateQrProfile(id, patch);
    if (!profile) {
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }

    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: { action: "update_profile", profileId: id },
    });

    return NextResponse.json({ profile });
  },
);

export const DELETE = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const deleted = await adminDeleteQrProfile(id);
    if (!deleted) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: { action: "delete_profile", profileId: id },
    });

    return NextResponse.json({ ok: true });
  },
);
