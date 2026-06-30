import { NextResponse } from "next/server";
import { withApi } from "@/lib/api/with-api";
import {
  countPushSubscriptionsForUser,
  findAdminUserById,
  adminUpdateUser,
  listQrProfilesByTutorAdmin,
} from "@/lib/db/queries";
import { logSecurityAudit } from "@/lib/security/audit";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (_request, context) => {
    const { id } = await (context.params as RouteContext["params"]);
    const user = await findAdminUserById(id);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const profiles = await listQrProfilesByTutorAdmin(id);
    const pushCount = await countPushSubscriptionsForUser(id);

    return NextResponse.json({
      user,
      profiles,
      pushSubscriptionCount: pushCount,
    });
  },
);

export const PATCH = withApi(
  { requireAdmin: true, rateLimit: "admin" },
  async (request, context, meta) => {
    const { id } = await (context.params as RouteContext["params"]);
    const body = await request.json();
    const { full_name, is_admin } = body as {
      full_name?: string;
      is_admin?: boolean;
    };

    if (full_name === undefined && is_admin === undefined) {
      return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });
    }

    const updated = await adminUpdateUser(id, { full_name, is_admin });
    if (!updated) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    await logSecurityAudit({
      eventType: "admin_access",
      ipHash: meta.ipHash,
      userId: meta.userId,
      details: {
        action: "update_user",
        targetUserId: id,
        changes: { full_name, is_admin },
      },
    });

    return NextResponse.json({ user: updated });
  },
);
