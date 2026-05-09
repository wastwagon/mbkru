import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSession: vi.fn(),
  memberCookieName: () => "mbkru_member",
  revokeMemberSessionFromToken: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    petition: { count: vi.fn() },
    member: { delete: vi.fn() },
  },
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/member/auth-api-guard", () => ({
  guardMemberAuthApi: () => null,
}));

vi.mock("@/lib/server/structured-log", () => ({
  logServerError: vi.fn(),
}));

import { cookies } from "next/headers";
import { POST } from "./route";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { getMemberSession } from "@/lib/member/session";

function req(body: unknown) {
  return new Request("https://example.com/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(getMemberSession).mockResolvedValue({ memberId: "mem1", email: "User@Example.com" });
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) => (name === "mbkru_member" ? { value: "jwt" } : undefined),
    } as never);
    vi.mocked(prisma.petition.count).mockResolvedValue(0);
    vi.mocked(prisma.member.delete).mockResolvedValue({} as never);
  });

  it("returns 400 when email confirmation does not match", async () => {
    const res = await POST(req({ confirmEmail: "other@example.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when member authored petitions", async () => {
    vi.mocked(prisma.petition.count).mockResolvedValue(2);
    const res = await POST(req({ confirmEmail: "user@example.com" }));
    expect(res.status).toBe(409);
    const j = (await res.json()) as { code?: string };
    expect(j.code).toBe("PETITIONS_AUTHORED");
  });

  it("deletes member when confirmation matches case-insensitively", async () => {
    const res = await POST(req({ confirmEmail: "user@example.com" }));
    expect(res.status).toBe(200);
    expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: "mem1" } });
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await POST(req({ confirmEmail: "user@example.com" }));
    expect(res.status).toBe(429);
  });
});
