import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserAccountById } from "@/lib/db/queries";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import {
  countUsedProfileShareSlots,
  createProfileShareInvite,
} from "@/lib/db/queries-profile-share-invites";
import {
  canManageShares,
  hasAnySharePermission,
  MAX_PROFILE_SHARES,
  normalizeSharePermissions,
} from "@/lib/profile-access";
import { getAppUrl } from "@/lib/utils/app-url";
import {
  buildProfileShareInviteWhatsAppMessage,
  buildWhatsAppShareUrl,
} from "@/lib/utils/whatsapp-share";

type RouteContext = { params: Promise<{ id: string }> };

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
    const body = await request.json().catch(() => ({}));
    const permissions = normalizeSharePermissions(body.permissions);
    if (!hasAnySharePermission(permissions)) {
      return NextResponse.json(
        { error: "Tenés que habilitar al menos un permiso" },
        { status: 400 },
      );
    }

    const usedSlots = await countUsedProfileShareSlots(id);
    if (usedSlots >= MAX_PROFILE_SHARES) {
      return NextResponse.json(
        { error: `Podés compartir este perfil con hasta ${MAX_PROFILE_SHARES} cuentas` },
        { status: 400 },
      );
    }

    let shareExpiresAt: string | null = null;
    if (body.expiresAt) {
      const parsed = new Date(body.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Fecha de vencimiento inválida" }, { status: 400 });
      }
      shareExpiresAt = parsed.toISOString();
    }

    const invite = await createProfileShareInvite({
      profileId: id,
      ownerUserId: session.userId,
      permissions,
      shareExpiresAt,
    });

    if (!invite) {
      return NextResponse.json({ error: "No se pudo crear la invitación" }, { status: 500 });
    }

    const inviteUrl = `${getAppUrl()}/compartir/${invite.token}`;
    const owner = await findUserAccountById(session.userId);
    const ownerLabel =
      owner?.full_name?.trim() || owner?.email?.split("@")[0] || "Alguien";
    const whatsappMessage = buildProfileShareInviteWhatsAppMessage({
      ownerLabel,
      profileName: access.profile.beneficiary_name,
      inviteUrl,
    });

    return NextResponse.json({
      invite,
      inviteUrl,
      whatsappUrl: buildWhatsAppShareUrl(whatsappMessage),
      inviteExpiresAt: invite.invite_expires_at,
    });
  } catch (error) {
    console.error("[profile-shares invite-link POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
