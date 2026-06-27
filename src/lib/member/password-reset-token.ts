import "server-only";

import { SignJWT, jwtVerify } from "jose";

import { getMemberSessionSecretKey } from "./jwt-config";

const MAX_AGE_SEC = 60 * 60; // 1 hour

function requireKey(): Uint8Array {
  const k = getMemberSessionSecretKey();
  if (!k) {
    throw new Error("MEMBER_SESSION_SECRET must be set for password reset.");
  }
  return k;
}

export async function createPasswordResetToken(memberId: string, email: string): Promise<string> {
  const jti = crypto.randomUUID();
  return new SignJWT({
    purpose: "password_reset",
    jti,
    email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(requireKey());
}

export async function verifyPasswordResetToken(
  token: string,
): Promise<{ memberId: string; email: string; jti: string } | null> {
  try {
    const { payload } = await jwtVerify(token, requireKey());
    if (payload.purpose !== "password_reset") return null;
    const memberId = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : "";
    const jti = typeof payload.jti === "string" ? payload.jti : "";
    if (!memberId || !email || !jti) return null;
    return { memberId, email, jti };
  } catch {
    return null;
  }
}

export { MAX_AGE_SEC as PASSWORD_RESET_MAX_AGE_SEC };
