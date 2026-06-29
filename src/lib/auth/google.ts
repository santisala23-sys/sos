import { cookies } from "next/headers";
import { getAppUrl } from "@/lib/utils/app-url";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";

export type GoogleUserInfo = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

function getGoogleConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth no configurado");
  }
  return { clientId, clientSecret };
}

export function getGoogleRedirectUri() {
  return `${getAppUrl()}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(state: string) {
  const { clientId } = getGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret } = getGoogleConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Google token error: ${detail}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error("Google no devolvió access_token");
  }
  return data.access_token;
}

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el perfil de Google");
  }

  const data = (await res.json()) as {
    id?: string;
    email?: string;
    name?: string;
    picture?: string;
    verified_email?: boolean;
  };

  if (!data.id || !data.email) {
    throw new Error("Perfil de Google incompleto");
  }

  if (data.verified_email === false) {
    throw new Error("El email de Google no está verificado");
  }

  return {
    id: data.id,
    email: data.email.toLowerCase(),
    name: data.name?.trim() || data.email.split("@")[0],
    picture: data.picture,
  };
}

export function googleOAuthStateCookieOptions(state: string) {
  return {
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };
}

export function clearGoogleOAuthStateCookieOptions() {
  return {
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export async function readGoogleOAuthState(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value ?? null;
}

export function isGoogleAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}
