import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const prisma = vi.hoisted(() => ({
  community: { findUnique: vi.fn() },
  member: { findUnique: vi.fn(), update: vi.fn() },
  communityMembership: { findUnique: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma }));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed") },
}));

const enqueueCommunityStewardCredentialsDelivery = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const processNotificationOutboxBatch = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/lib/server/community-member-transactional-outbox", () => ({
  enqueueCommunityStewardCredentialsDelivery,
}));

vi.mock("@/lib/server/notification-outbox", () => ({
  processNotificationOutboxBatch,
}));

vi.mock("@/lib/server/generate-temporary-password", () => ({
  generateTemporaryPassword: () => "TempPass!12345678",
}));

import { resendCommunityStewardCredentials } from "./community-steward-provision";

const COMM = "cjld2cjxh0000qzrmn831i7ra";
const MEM = "cjld2cjxh0000qzrmn831i7rb";

describe("resendCommunityStewardCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.community.findUnique.mockResolvedValue({
      id: COMM,
      slug: "ajumako-traditional-council",
      name: "Ajumako",
    });
    prisma.communityMembership.findUnique.mockResolvedValue({
      role: "QUEEN_MOTHER_VERIFIED",
      state: "ACTIVE",
    });
    prisma.member.findUnique.mockResolvedValue({ id: MEM, email: "queen@example.com" });
    prisma.member.update.mockResolvedValue({});
  });

  it("resets password and emails steward", async () => {
    const result = await resendCommunityStewardCredentials({ communityId: COMM, memberId: MEM });
    expect(result.ok).toBe(true);
    expect(prisma.member.update).toHaveBeenCalled();
    expect(enqueueCommunityStewardCredentialsDelivery).toHaveBeenCalled();
  });

  it("rejects non-steward memberships", async () => {
    prisma.communityMembership.findUnique.mockResolvedValue({ role: "MEMBER", state: "ACTIVE" });
    const result = await resendCommunityStewardCredentials({ communityId: COMM, memberId: MEM });
    expect(result).toEqual({ ok: false, code: "not_steward" });
  });
});
