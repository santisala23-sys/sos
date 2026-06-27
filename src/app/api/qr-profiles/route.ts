import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createQrProfile, listQrProfilesByTutor } from "@/lib/db/queries";
import { generateSlug } from "@/lib/utils/slug";

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
    } = body as {
      beneficiary_name?: string;
      emergency_contact_name?: string;
      emergency_contact_phone?: string;
      secondary_contact_name?: string | null;
      secondary_contact_phone?: string | null;
      instructions?: string;
      medical_notes?: string;
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
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("[qr-profiles POST]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
