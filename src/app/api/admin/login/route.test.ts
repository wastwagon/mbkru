import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/session", () => ({
  createAdminSessionToken: vi.fn().mockResolvedValue("test.admin.jwt"),
  adminCookieName: () => "mbkru_admin",
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
    },
  },
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn().mockResolvedValue(true),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

import bcrypt from "bcryptjs";
import { POST } from "./route";
import { createAdminSessionToken } from "@/lib/admin/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

function req(body: unknown) {
  return new Request("https://example.com/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(prisma.admin.findUnique).mockReset();
    vi.mocked(bcrypt.compare).mockReset();
    vi.mocked(createAdminSessionToken).mockClear();
  });

  it("returns 503 when database is not configured", async () => {
    vi.mocked(isDatabaseConfigured).mockReturnValue(false);
    const res = await POST(req({ email: "a@b.com", password: "x" }));
    expect(res.status).toBe(503);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowPublicFormRequest).mockResolvedValue(false);
    const res = await POST(req({ email: "a@b.com", password: "x" }));
    expect(res.status).toBe(429);
  });

  it("returns 400 when email or password missing", async () => {
    const res = await POST(req({ email: "", password: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when admin not found", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);
    const res = await POST(req({ email: "nobody@example.com", password: "secret" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 when password does not match", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue({
      id: "admin1",
      email: "admin@example.com",
      password: "hashed",
      createdAt: new Date(),
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    const res = await POST(req({ email: "admin@example.com", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 200, sets session cookie, and calls createAdminSessionToken on success", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue({
      id: "admin1",
      email: "admin@example.com",
      password: "hashed",
      createdAt: new Date(),
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    const res = await POST(req({ email: "admin@example.com", password: "correct" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toContain("mbkru_admin=");
    expect(res.headers.get("set-cookie")).toContain("test.admin.jwt");
    expect(createAdminSessionToken).toHaveBeenCalledWith("admin1");
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
