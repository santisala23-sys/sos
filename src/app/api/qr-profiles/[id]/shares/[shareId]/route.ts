import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { accessDenied, requireProfileAccess } from "@/lib/api/profile-access";
import {
  listProfileSharesForOwner,
  revokeProfileShare,
  updateProfileShare,
} from "@/lib/db/queries-profile-shares";
import {
  canManageShares,
  hasAnySharePermission,
  normalizeSharePermissions,
} from "@/lib/profile-access";

type RouteContext = { params: Promise<{ id: string; shareId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, shareId } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canManageShares(access)) {
    return accessDenied();
  }

  try {
    const body = await request.json();
    const permissions = normalizeSharePermissions(body.permissions);
    if (!hasAnySharePermission(permissions)) {
      return NextResponse.json(
        { error: "Tenés que habilitar al menos un permiso" },
        { status: 400 },
      );
    }

    const existingShares = await listProfileSharesForOwner(id, session.userId);
    const existing = existingShares.find((item) => item.id === shareId);
    if (!existing) {
      return NextResponse.json({ error: "Compartido no encontrado" }, { status: 404 });
    }

    let expiresAt: string | null = existing.expires_at;
    if (body.expiresAt === null || body.expiresAt === "") {
      expiresAt = null;
    } else if (body.expiresAt !== undefined) {
      const parsed = new Date(body.expiresAt);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Fecha de vencimiento inválida" }, { status: 400 });
      }
      expiresAt = parsed.toISOString();
    }

    const share = await updateProfileShare({
      shareId,
      ownerUserId: session.userId,
      permissions,
      expiresAt,
    });

    if (!share) {
      return NextResponse.json({ error: "Compartido no encontrado" }, { status: 404 });
    }

    const shares = await listProfileSharesForOwner(id, session.userId);
    return NextResponse.json({ share, shares });
  } catch (error) {
    console.error("[profile-shares PATCH]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, shareId } = await params;
  const access = await requireProfileAccess(id, session.userId);
  if (access instanceof NextResponse) return access;
  if (!canManageShares(access)) {
    return accessDenied();
  }

  const revoked = await revokeProfileShare(shareId, session.userId);
  if (!revoked) {
    return NextResponse.json({ error: "Compartido no encontrado" }, { status: 404 });
  }

  const shares = await listProfileSharesForOwner(id, session.userId);
  return NextResponse.json({ ok: true, shares });
}
