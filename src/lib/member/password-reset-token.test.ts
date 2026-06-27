import { describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const key = new TextEncoder().encode("test-member-session-secret-32chars!!");

vi.mock("@/lib/member/jwt-config", () => ({
  getMemberSessionSecretKey: () => key,
}));

import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from "./password-reset-token";

describe("password-reset-token", () => {
  it("round-trips a valid reset token", async () => {
    const token = await createPasswordResetToken("member-1", "user@example.com");
    const claims = await verifyPasswordResetToken(token);
    expect(claims).toEqual({
      memberId: "member-1",
      email: "user@example.com",
      jti: expect.any(String),
    });
  });

  it("rejects tokens with the wrong purpose", async () => {
    const bad = await new SignJWT({ purpose: "other", jti: "x", email: "a@b.c" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("member-1")
      .setExpirationTime("1h")
      .sign(key);
    expect(await verifyPasswordResetToken(bad)).toBeNull();
  });
});
