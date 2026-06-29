import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashPassword } from "@/lib/auth/password";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { createUser, findUserByEmail } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body as {
      email?: string;
      password?: string;
      fullName?: string;
    };

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, contraseña y nombre son requeridos" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 },
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      const hint = existing.google_id
        ? "Ya tenés cuenta con Google. Usá «Continuar con Google»."
        : "Ya existe una cuenta con ese email";
      return NextResponse.json({ error: hint }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash, fullName);
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieOptions(token));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    console.error("[auth/register]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
