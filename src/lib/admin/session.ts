import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { getSessionSecretKey } from "./jwt-config";

const COOKIE_NAME = "mbkru_admin";

function requireKey(): Uint8Array {
  const key = getSessionSecretKey();
  if (!key) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set (min 32 characters) for admin login."
    );
  }
  return key;
}

export async function createAdminSessionToken(adminId: string): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(requireKey());
}

export async function verifyAdminSessionToken(token: string) {
  const { payload } = await jwtVerify(token, requireKey());
  return { adminId: payload.sub as string };
}

export async function getAdminSession(): Promise<{ adminId: string } | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminSessionToken(token);
  } catch {
    return null;
  }
}

export function adminCookieName(): string {
  return COOKIE_NAME;
}

export async function clearAdminSessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}
