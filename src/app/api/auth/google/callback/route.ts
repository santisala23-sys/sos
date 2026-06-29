import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearGoogleOAuthStateCookieOptions,
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  readGoogleOAuthState,
} from "@/lib/auth/google";
import {
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { findOrCreateGoogleUser } from "@/lib/db/queries";
import { getAppUrl } from "@/lib/utils/app-url";

export async function GET(request: Request) {
  const appUrl = getAppUrl();
  const loginUrl = `${appUrl}/login`;

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");

    if (oauthError) {
      const cookieStore = await cookies();
      cookieStore.set(clearGoogleOAuthStateCookieOptions());
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Inicio con Google cancelado")}`,
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Respuesta de Google incompleta")}`,
      );
    }

    const savedState = await readGoogleOAuthState();
    const cookieStore = await cookies();
    cookieStore.set(clearGoogleOAuthStateCookieOptions());

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Sesión de Google inválida. Probá de nuevo.")}`,
      );
    }

    const accessToken = await exchangeGoogleCode(code);
    const googleUser = await fetchGoogleUserInfo(accessToken);
    const user = await findOrCreateGoogleUser(googleUser);

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });
    cookieStore.set(sessionCookieOptions(token));

    return NextResponse.redirect(`${appUrl}/dashboard`);
  } catch (err) {
    console.error("[auth/google/callback]", err);
    const message =
      err instanceof Error ? err.message : "Error al iniciar con Google";
    return NextResponse.redirect(
      `${loginUrl}?error=${encodeURIComponent(message)}`,
    );
  }
}
