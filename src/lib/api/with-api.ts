import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hashIp, getClientIp } from "@/lib/security/client-ip";
import {
  checkRateLimit,
  rateLimitKey,
  type RateLimitPreset,
} from "@/lib/security/rate-limit";
import { logApiRequest, logSecurityAudit } from "@/lib/security/audit";
import { isUserAdmin } from "@/lib/auth/admin";

export type ApiRouteContext = {
  params?: Promise<Record<string, string>>;
};

export type ApiRouteOptions = {
  rateLimit?: RateLimitPreset;
  rateLimitSuffix?: string;
  requireAdmin?: boolean;
  skipLogging?: boolean;
};

type RouteHandler = (
  request: Request,
  context: ApiRouteContext,
  meta: ApiRouteMeta,
) => Promise<NextResponse>;

export type ApiRouteMeta = {
  ipHash: string | null;
  userId: string | null;
  isAdmin: boolean;
};

export function withApi(
  options: ApiRouteOptions,
  handler: RouteHandler,
) {
  return async (
    request: Request,
    context: ApiRouteContext = {},
  ): Promise<NextResponse> => {
    const start = Date.now();
    const url = new URL(request.url);
    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    let statusCode = 500;
    let errorMessage: string | null = null;
    let userId: string | null = null;
    let isAdmin = false;

    try {
      const session = await getSession();
      userId = session?.userId ?? null;

      if (options.requireAdmin) {
        if (!userId) {
          statusCode = 401;
          return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }
        isAdmin = await isUserAdmin(userId);
        if (!isAdmin) {
          await logSecurityAudit({
            eventType: "admin_access",
            ipHash,
            userId,
            details: { path: url.pathname, denied: true },
          });
          statusCode = 403;
          return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }
      }

      if (options.rateLimit) {
        const key = rateLimitKey(
          options.rateLimit,
          ipHash,
          options.rateLimitSuffix,
        );
        const rl = await checkRateLimit(key, options.rateLimit);
        if (!rl.allowed) {
          await logSecurityAudit({
            eventType: "rate_limited",
            ipHash,
            userId,
            details: { path: url.pathname, preset: options.rateLimit },
          });
          statusCode = 429;
          return NextResponse.json(
            { error: "Demasiadas solicitudes. Intentá más tarde." },
            {
              status: 429,
              headers: { "Retry-After": String(rl.retryAfterSec) },
            },
          );
        }
      }

      const response = await handler(request, context, {
        ipHash,
        userId,
        isAdmin,
      });
      statusCode = response.status;
      return response;
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "Error interno";
      console.error(`[api ${request.method} ${url.pathname}]`, error);
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    } finally {
      if (!options.skipLogging) {
        const durationMs = Date.now() - start;
        void logApiRequest({
          path: url.pathname,
          method: request.method,
          statusCode,
          durationMs,
          ipHash,
          userId,
          errorMessage,
        });
      }
    }
  };
}
