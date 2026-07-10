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
import {
  findOrCreateGoogleUser,
  findUserByEmail,
  findUserByGoogleId,
  recordEligibleDeclaration,
  recordTermsAcceptance,
} from "@/lib/db/queries";
import { getSql } from "@/lib/db/index";
import {
  clearEligiblePendingCookieOptions,
  clearTermsPendingCookieOptions,
  legalAcceptancePayload,
} from "@/lib/legal/terms-cookie";
import {
  ELIGIBLE_PENDING_COOKIE,
  TERMS_PENDING_COOKIE,
} from "@/lib/legal/constants";
import { getAppUrl } from "@/lib/utils/app-url";

export async function GET(request: Request) {
  const appUrl = getAppUrl();
  const loginUrl = `${appUrl}/login`;
  const registerUrl = `${appUrl}/register`;

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

    const termsPending = cookieStore.get(TERMS_PENDING_COOKIE)?.value;
    const eligiblePending = cookieStore.get(ELIGIBLE_PENDING_COOKIE)?.value;

    const existing =
      (await findUserByGoogleId(googleUser.id)) ??
      (await findUserByEmail(googleUser.email));

    if (!existing && !eligiblePending) {
      cookieStore.set(clearTermsPendingCookieOptions());
      cookieStore.set(clearEligiblePendingCookieOptions());
      return NextResponse.redirect(
        `${registerUrl}?error=${encodeURIComponent(
          "Para crear tu cuenta usá Registrate y confirmá que sos mayor de edad o tutor/responsable legal.",
        )}`,
      );
    }

    const legal = termsPending && eligiblePending ? legalAcceptancePayload() : undefined;
    const user = await findOrCreateGoogleUser(googleUser, legal);

    const sql = getSql();
    const statusRows = await sql`
      SELECT deletion_requested_at, deleted_at
      FROM users
      WHERE id = ${user.id}
      LIMIT 1
    `;
    const status = statusRows[0] as
      | { deletion_requested_at: string | null; deleted_at: string | null }
      | undefined;
    if (status?.deleted_at) {
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Esta cuenta fue dada de baja")}`,
      );
    }
    if (status?.deletion_requested_at) {
      return NextResponse.redirect(
        `${loginUrl}?error=${encodeURIComponent("Tu cuenta tiene una baja solicitada")}`,
      );
    }

    if (termsPending) {
      const payload = legalAcceptancePayload();
      await recordTermsAcceptance(
        user.id,
        payload.termsVersion,
        payload.privacyVersion,
      );
      cookieStore.set(clearTermsPendingCookieOptions());
    }

    if (eligiblePending) {
      const payload = legalAcceptancePayload();
      await recordEligibleDeclaration(user.id, payload.eligibleVersion);
      cookieStore.set(clearEligiblePendingCookieOptions());
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      emailVerified: true,
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
