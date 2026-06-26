/**
 * Next.js 16 **proxy** entry — replaces separate `middleware.ts` when both would conflict.
 * Handles admin/member session verification, public under-construction gate, and private `X-Robots-Tag`.
 */
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSessionSecretKey } from "@/lib/admin/jwt-config";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import {
  isConstructionGateExemptPath,
  isConstructionGatedApiPath,
} from "@/lib/construction-gate-paths";
import { MEMBER_SESSION_COOKIE } from "@/lib/member/cookie-name";
import { getMemberSessionSecretKey } from "@/lib/member/jwt-config";

const ADMIN_COOKIE = "mbkru_admin";

const GATE_CACHE_MS = 5000;
let gateCache: { at: number; underConstruction: boolean } | null = null;

function privateSurfaceHeaders(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

function envConstructionOverride(): boolean {
  const raw = process.env.PUBLIC_UNDER_CONSTRUCTION?.trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const key = getSessionSecretKey();
  if (!key) return false;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.role === "admin" || payload.role === undefined;
  } catch {
    return false;
  }
}

async function fetchUnderConstructionFlag(request: NextRequest): Promise<boolean> {
  if (envConstructionOverride()) return true;

  const now = Date.now();
  if (gateCache && now - gateCache.at < GATE_CACHE_MS) {
    return gateCache.underConstruction;
  }

  try {
    const url = new URL("/api/site-gate", request.url);
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000),
      headers: { "x-mbkru-proxy": "1" },
    });
    if (!res.ok) {
      gateCache = { at: now, underConstruction: false };
      return false;
    }
    const body = (await res.json()) as { underConstruction?: boolean };
    const underConstruction = Boolean(body.underConstruction);
    gateCache = { at: now, underConstruction };
    return underConstruction;
  } catch {
    gateCache = { at: now, underConstruction: false };
    return false;
  }
}

function constructionRedirect(request: NextRequest): NextResponse {
  const dest = new URL("/under-construction", request.url);
  return NextResponse.redirect(dest);
}

function constructionApiResponse(): NextResponse {
  return NextResponse.json(
    {
      error: "Site temporarily unavailable",
      underConstruction: true,
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
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

async function enforcePublicConstructionGate(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (isConstructionGateExemptPath(pathname)) return null;

  if (await hasValidAdminSession(request)) return null;

  if (!(await fetchUnderConstructionFlag(request))) return null;

  if (isConstructionGatedApiPath(pathname)) {
    return constructionApiResponse();
  }

  if (pathname === "/under-construction") return null;
  return constructionRedirect(request);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const constructionDenied = await enforcePublicConstructionGate(request);
  if (constructionDenied) return privateSurfaceHeaders(constructionDenied);

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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|css|woff2?|txt|xml|json|map|webmanifest)$).*)",
  ],
};
