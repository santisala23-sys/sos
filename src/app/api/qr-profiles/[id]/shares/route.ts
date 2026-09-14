import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import { findUserByEmail } from "@/lib/db/queries";
import { countUsedProfileShareSlots } from "@/lib/db/queries-profile-share-invites";
import {
  listProfileSharesForOwner,
  upsertProfileShare,
} from "@/lib/db/queries-profile-shares";
import { notifyProfileShare } from "@/lib/email/notify-profile-share";
import {
  canManageShares,
  hasAnySharePermission,
  MAX_PROFILE_SHARES,
  normalizeSharePermissions,
} from "@/lib/profile-access";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canManageShares(access)) {
    return accessDenied();
  }

  const shares = await listProfileSharesForOwner(id, session.userId);
  return NextResponse.json({ shares });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canManageShares(access)) {
    return accessDenied();
  }

  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "El email es requerido" }, { status: 400 });
    }

    const permissions = normalizeSharePermissions(body.permissions);
    if (!hasAnySharePermission(permissions)) {
      return NextResponse.json(
        { error: "Tenés que habilitar al menos un permiso" },
        { status: 400 },
      );
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
      return NextResponse.json(
        { error: "No hay una cuenta SOSme con ese email. La persona tiene que registrarse primero." },
        { status: 404 },
      );
    }

    if (targetUser.id === session.userId) {
      return NextResponse.json(
        { error: "No podés compartir un perfil con vos mismo" },
        { status: 400 },
      );
    }

    const usedSlots = await countUsedProfileShareSlots(id);
    const existingShares = await listProfileSharesForOwner(id, session.userId);
    const alreadyShared = existingShares.some((s) => s.shared_with_user_id === targetUser.id);
    if (!alreadyShared && usedSlots >= MAX_PROFILE_SHARES) {
      return NextResponse.json(
        { error: `Podés compartir este perfil con hasta ${MAX_PROFILE_SHARES} cuentas` },
        { status: 400 },
      );
    }

    let expiresAt: string | null = null;
    if (body.expiresAt) {
      const parsed = new Date(body.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Fecha de vencimiento inválida" }, { status: 400 });
      }
      expiresAt = parsed.toISOString();
    }

    const share = await upsertProfileShare({
      profileId: id,
      ownerUserId: session.userId,
      sharedWithUserId: targetUser.id,
      permissions,
      expiresAt,
    });

    if (!share) {
      return NextResponse.json({ error: "No se pudo compartir el perfil" }, { status: 500 });
    }

    void notifyProfileShare({
      ownerUserId: session.userId,
      recipientUserId: targetUser.id,
      recipientEmail: targetUser.email,
      profileName: access.profile.beneficiary_name,
      profileType: access.profile.profile_type,
      permissions,
      expiresAt,
      isUpdate: alreadyShared,
    }).catch((error) => {
      console.error("[profile-shares POST] email", error);
    });

    const shares = await listProfileSharesForOwner(id, session.userId);
    return NextResponse.json({ share, shares });
  } catch (error) {
    console.error("[profile-shares POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
