import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
  buildGoogleAuthUrl,
  googleOAuthStateCookieOptions,
  isGoogleAuthConfigured,
} from "@/lib/auth/google";

export async function GET() {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth no está configurado en el servidor" },
      { status: 503 },
    );
  }

  const state = randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(googleOAuthStateCookieOptions(state));

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
