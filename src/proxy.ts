/**
 * Next.js 16 **proxy** entry — replaces separate `middleware.ts` when both would conflict.
 * Handles admin/member session verification and sets `X-Robots-Tag` on private surfaces.
 */
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionSecretKey } from "@/lib/admin/jwt-config";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { MEMBER_SESSION_COOKIE } from "@/lib/member/cookie-name";
import { getMemberSessionSecretKey } from "@/lib/member/jwt-config";

const ADMIN_COOKIE = "mbkru_admin";

function privateSurfaceHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

/** Require valid member JWT cookie; otherwise redirect to login with `next` (or config error). */
async function enforceMemberSession(request: NextRequest): Promise<NextResponse | null> {
  const key = getMemberSessionSecretKey();
  if (!key) {
    return privateSurfaceHeaders(
      NextResponse.redirect(new URL("/login?error=config", request.url)),
    );
  }

  const token = request.cookies.get(MEMBER_SESSION_COOKIE)?.value;
  const { pathname } = request.nextUrl;
  if (!token) {
    const next = encodeURIComponent(pathname + request.nextUrl.search);
    return privateSurfaceHeaders(
      NextResponse.redirect(new URL(`/login?next=${next}`, request.url)),
    );
  }

  try {
    const { payload } = await jwtVerify(token, key);
    if (payload.role !== "member") {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
    return null;
  } catch {
    return privateSurfaceHeaders(NextResponse.redirect(new URL("/login", request.url)));
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return privateSurfaceHeaders(NextResponse.next());
    }

    const key = getSessionSecretKey();
    if (!key) {
      return privateSurfaceHeaders(
        NextResponse.redirect(new URL("/admin/login?error=config", request.url)),
      );
    }

    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    try {
      await jwtVerify(token, key);
      return privateSurfaceHeaders(NextResponse.next());
    } catch {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }
  }

  const phase = getServerPlatformPhase();

  if (pathname.startsWith("/account")) {
    if (!platformFeatures.authentication(phase)) {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/", request.url)));
    }

    const denied = await enforceMemberSession(request);
    if (denied) return denied;
    return privateSurfaceHeaders(NextResponse.next());
  }

  if (
    (pathname === "/citizens-voice/submit" || pathname === "/citizens-voice/submit/election") &&
    platformFeatures.authentication(phase) &&
    platformFeatures.citizensVoicePlatform(phase)
  ) {
    const denied = await enforceMemberSession(request);
    if (denied) return denied;
    return privateSurfaceHeaders(NextResponse.next());
  }

  if (
    pathname === "/track-report" &&
    platformFeatures.authentication(phase) &&
    platformFeatures.citizensVoicePlatform(phase)
  ) {
    const denied = await enforceMemberSession(request);
    if (denied) return denied;
    return privateSurfaceHeaders(NextResponse.next());
  }

  if (
    pathname === "/situational-alerts/submit" &&
    platformFeatures.authentication(phase) &&
    platformFeatures.situationalAlertsSystem(phase)
  ) {
    const denied = await enforceMemberSession(request);
    if (denied) return denied;
    return privateSurfaceHeaders(NextResponse.next());
  }

  if (
    pathname === "/petitions/new" &&
    platformFeatures.authentication(phase) &&
    platformFeatures.citizensVoicePlatform(phase)
  ) {
    const denied = await enforceMemberSession(request);
    if (denied) return denied;
    return privateSurfaceHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account",
    "/account/:path*",
    "/citizens-voice/submit",
    "/citizens-voice/submit/election",
    "/track-report",
    "/situational-alerts/submit",
    "/petitions/new",
  ],
};
