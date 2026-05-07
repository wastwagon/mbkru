import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/admin/session", () => ({
  getAdminSession: vi.fn(),
}));

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    notificationDeliveryJob: {
      updateMany: vi.fn(),
    },
    adminOperationalAuditLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: mockPrisma,
  isDatabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowAdminSessionRequest: vi.fn(),
}));

import { POST } from "./route";
import { getAdminSession } from "@/lib/admin/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { allowAdminSessionRequest } from "@/lib/server/rate-limit";

describe("POST /api/admin/notifications/retry", () => {
  beforeEach(() => {
    vi.mocked(getAdminSession).mockReset();
    vi.mocked(isDatabaseConfigured).mockReset();
    vi.mocked(allowAdminSessionRequest).mockReset();
    mockPrisma.notificationDeliveryJob.updateMany.mockReset();
    mockPrisma.adminOperationalAuditLog.create.mockReset();
    vi.mocked(getAdminSession).mockResolvedValue({ adminId: "admin1" });
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(true);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getAdminSession).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api/admin/notifications/retry", {
        method: "POST",
        body: JSON.stringify({ id: "cjld2cjxh0000qzrmn831i7ra" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(allowAdminSessionRequest).mockResolvedValue(false);
    const res = await POST(
      new Request("http://localhost/api/admin/notifications/retry", {
        method: "POST",
        body: JSON.stringify({ id: "cjld2cjxh0000qzrmn831i7ra" }),
      }),
    );
    expect(res.status).toBe(429);
  });

  it("retries a failed job", async () => {
    mockPrisma.notificationDeliveryJob.updateMany.mockResolvedValue({ count: 1 });
    const res = await POST(
      new Request("http://localhost/api/admin/notifications/retry", {
        method: "POST",
        body: JSON.stringify({ id: "cjld2cjxh0000qzrmn831i7ra" }),
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.updated).toBe(1);
    expect(mockPrisma.adminOperationalAuditLog.create).toHaveBeenCalledTimes(1);
  });
});
