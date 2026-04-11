/**
 * Next.js 16 **proxy** entry — replaces separate `middleware.ts` when both would conflict.
 * Handles admin/member session verification and sets `X-Robots-Tag` on private surfaces.
 */
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionSecretKey } from "@/lib/admin/jwt-config";
import { getPublicPlatformPhase, platformFeatures } from "@/config/platform";
import { MEMBER_SESSION_COOKIE } from "@/lib/member/cookie-name";
import { getMemberSessionSecretKey } from "@/lib/member/jwt-config";

const ADMIN_COOKIE = "mbkru_admin";

function privateSurfaceHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
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

  if (pathname.startsWith("/account")) {
    if (!platformFeatures.authentication(getPublicPlatformPhase())) {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/", request.url)));
    }

    const key = getMemberSessionSecretKey();
    if (!key) {
      return privateSurfaceHeaders(
        NextResponse.redirect(new URL("/login?error=config", request.url)),
      );
    }

    const token = request.cookies.get(MEMBER_SESSION_COOKIE)?.value;
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
      return privateSurfaceHeaders(NextResponse.next());
    } catch {
      return privateSurfaceHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account", "/account/:path*"],
};
