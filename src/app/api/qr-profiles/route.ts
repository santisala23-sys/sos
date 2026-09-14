import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listQrProfilesByTutor } from "@/lib/db/queries";
import { listAllProfileSharesForOwnerUser } from "@/lib/db/queries-profile-shares";
import type { ProfileShareWithUser } from "@/types/database";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [profiles, allShares] = await Promise.all([
    listQrProfilesByTutor(session.userId),
    listAllProfileSharesForOwnerUser(session.userId),
  ]);

  const sharesByProfile = allShares.reduce<Record<string, ProfileShareWithUser[]>>(
    (acc, share) => {
      const list = acc[share.profile_id] ?? [];
      list.push(share);
      acc[share.profile_id] = list;
      return acc;
    },
    {},
  );

  return NextResponse.json({
    profiles: profiles.map((profile) => ({
      ...profile,
      shares: sharesByProfile[profile.id] ?? [],
    })),
  });
}

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Para agregar un perfil tenés que activar un producto SOSme escaneando su QR.",
      code: "ACTIVATION_REQUIRED",
    },
    { status: 403 },
  );
}
