import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/auth/admin";
import {
  checkEdgeRateLimit,
  edgeRateLimitResponse,
  getEdgeClientIp,
} from "@/lib/security/edge-rate-limit";

function getPublicRateLimitPreset(pathname: string): "public" | "contact" | null {
  if (pathname === "/api/contact") return "contact";
  if (/^\/p\/[^/]+$/.test(pathname)) return "public";
  if (/^\/api\/p\/[^/]+/.test(pathname)) return "public";
  if (pathname.startsWith("/api/alerts/")) return "public";
  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const rateLimitPreset = getPublicRateLimitPreset(pathname);
  if (rateLimitPreset) {
    const ip = getEdgeClientIp(request);
    const rl = checkEdgeRateLimit(ip, rateLimitPreset, pathname);
    if (!rl.allowed) {
      return edgeRateLimitResponse(rl.retryAfterSec);
    }
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" || pathname === "/register";
  const isVerifyPage = pathname === "/verificar";

  const needsVerification = !!session && session.emailVerified === false;

  if (isVerifyPage) {
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (!needsVerification) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if ((isDashboard || isAdmin) && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (needsVerification && (isDashboard || isAdmin || isAuthPage)) {
    return NextResponse.redirect(new URL("/verificar", request.url));
  }

  if (isAdmin && session) {
    const admin = await isUserAdmin(session.userId);
    if (!admin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone();
    const redirect = request.nextUrl.searchParams.get("redirect");
    url.pathname =
      redirect && redirect.startsWith("/") ? redirect : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/p/:slug",
    "/api/contact",
    "/api/p/:slug/:path*",
    "/api/alerts/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/verificar",
  ],
};
