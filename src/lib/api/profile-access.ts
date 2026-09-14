import { NextResponse } from "next/server";
import { getProfileAccessForUser } from "@/lib/db/queries-profile-shares";
import type { ProfileAccess } from "@/lib/profile-access";

export async function requireProfileAccess(
  profileId: string,
  userId: string,
): Promise<ProfileAccess | NextResponse> {
  const access = await getProfileAccessForUser(profileId, userId);
  if (!access) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }
  return access;
}

export function accessDenied(message = "No tenés permiso para esta acción"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}
