import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { MEMBER_SESSION_COOKIE } from "./cookie-name";
import { getMemberSessionSecretKey } from "./jwt-config";
import { isMemberJtiActive, rememberMemberJti, revokeMemberJti } from "./member-jti-redis";

const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function requireKey(): Uint8Array {
  const k = getMemberSessionSecretKey();
  if (!k) {
    throw new Error("MEMBER_SESSION_SECRET must be set (min 32 characters) for member auth.");
  }
  return k;
}

export function memberCookieName(): string {
  return MEMBER_SESSION_COOKIE;
}

export async function createMemberSessionToken(
  memberId: string,
  email: string,
): Promise<string> {
  const jti = crypto.randomUUID();
  const token = await new SignJWT({
    role: "member",
    jti,
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(requireKey());

  await rememberMemberJti(jti, MAX_AGE_SEC);
  return token;
}

function memberSessionTokenFromCookieHeader(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const prefix = `${MEMBER_SESSION_COOKIE}=`;
  for (const segment of cookieHeader.split(";")) {
    const part = segment.trim();
    if (!part.startsWith(prefix)) continue;
    const raw = part.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return undefined;
}

/**
 * Resolve the member session from the incoming HTTP `Cookie` header.
 * Prefer this in Route Handlers that receive `Request` — `cookies()` from `next/headers` can
 * disagree with the actual request in some edge/runtime combinations.
 */
export async function getMemberSessionFromRequest(
  request: Request,
): Promise<{ memberId: string; email: string } | null> {
  try {
    const token = memberSessionTokenFromCookieHeader(request.headers.get("cookie"));
    if (!token) return null;
    return verifyMemberSessionToken(token);
  } catch {
    return null;
  }
}

export async function verifyMemberSessionToken(token: string): Promise<{
  memberId: string;
  email: string;
} | null> {
  try {
    const { payload } = await jwtVerify(token, requireKey());
    if (payload.role !== "member") return null;
    const memberId = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : "";
    const jti = typeof payload.jti === "string" ? payload.jti : "";
    if (!memberId || !email || !jti) return null;
    if (!(await isMemberJtiActive(jti))) return null;
    return { memberId, email };
  } catch {
    return null;
  }
}

export async function getMemberSession(): Promise<{ memberId: string; email: string } | null> {
  try {
    const token = (await cookies()).get(MEMBER_SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifyMemberSessionToken(token);
  } catch {
    return null;
  }
}

export async function clearMemberSessionCookie(): Promise<void> {
  (await cookies()).delete(MEMBER_SESSION_COOKIE);
}

/** Parse token, revoke Redis jti (if any), clear cookie. Call from logout route after reading cookie into Response. */
export async function revokeMemberSessionFromToken(token: string): Promise<void> {
  if (!token.trim()) return;
  const key = getMemberSessionSecretKey();
  if (!key) return;
  try {
    const { payload } = await jwtVerify(token, key);
    const jti = typeof payload.jti === "string" ? payload.jti : "";
    if (jti) await revokeMemberJti(jti);
  } catch {
    /* invalid token — nothing to revoke */
  }
}
