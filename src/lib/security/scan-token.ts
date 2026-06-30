import { SignJWT, jwtVerify } from "jose";
import { SCAN_SESSION_TTL_MS } from "@/lib/scan-session/storage";

export const SCAN_TOKEN_KIND = "scanner_session";

export type ScanTokenPayload = {
  scanLogId: string;
  slug: string;
  kind: typeof SCAN_TOKEN_KIND;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET no está configurada");
  }
  return new TextEncoder().encode(secret);
}

export async function createScanToken(
  payload: Omit<ScanTokenPayload, "kind">,
): Promise<string> {
  const maxAgeSec = Math.floor(SCAN_SESSION_TTL_MS / 1000);
  return new SignJWT({ ...payload, kind: SCAN_TOKEN_KIND })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(getSecret());
}

export async function verifyScanToken(
  token: string,
): Promise<ScanTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      payload.kind !== SCAN_TOKEN_KIND ||
      !payload.scanLogId ||
      !payload.slug
    ) {
      return null;
    }
    return {
      scanLogId: String(payload.scanLogId),
      slug: String(payload.slug),
      kind: SCAN_TOKEN_KIND,
    };
  } catch {
    return null;
  }
}

export function getScanTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim() || null;
  }
  return null;
}

export async function getScanTokenFromRequestBody(
  request: Request,
): Promise<string | null> {
  const header = getScanTokenFromRequest(request);
  if (header) return header;

  try {
    const cloned = request.clone();
    const body = (await cloned.json()) as { scanToken?: string };
    return body.scanToken?.trim() || null;
  } catch {
    return null;
  }
}
