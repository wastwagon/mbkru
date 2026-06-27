import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const prisma = vi.hoisted(() => ({
  community: { findUnique: vi.fn() },
  member: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  communityMembership: { upsert: vi.fn() },
  communityVerificationRequest: { updateMany: vi.fn() },
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

import { provisionCommunitySteward } from "./community-steward-provision";

const COMM = "cjld2cjxh0000qzrmn831i7ra";
const MEM = "cjld2cjxh0000qzrmn831i7rb";

describe("provisionCommunitySteward", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.community.findUnique.mockResolvedValue({
      id: COMM,
      slug: "ajumako-traditional-council",
      name: "Ajumako",
      regionId: null,
    });
    prisma.communityMembership.upsert.mockResolvedValue({});
    prisma.communityVerificationRequest.updateMany.mockResolvedValue({ count: 0 });
  });

  it("creates a new member and emails credentials", async () => {
    prisma.member.findUnique.mockResolvedValue(null);
    prisma.member.create.mockResolvedValue({ id: MEM });

    const result = await provisionCommunitySteward({
      communityId: COMM,
      email: "queen@example.com",
      displayName: "Nana Example",
      role: "QUEEN_MOTHER_VERIFIED",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.createdMember).toBe(true);
    expect(result.password).toBe("TempPass!12345678");
    expect(prisma.communityMembership.upsert).toHaveBeenCalled();
    expect(enqueueCommunityStewardCredentialsDelivery).toHaveBeenCalledWith(
      expect.objectContaining({
        memberId: MEM,
        email: "queen@example.com",
        role: "QUEEN_MOTHER_VERIFIED",
      }),
    );
  });

  it("rejects invalid roles", async () => {
    const result = await provisionCommunitySteward({
      communityId: COMM,
      email: "x@example.com",
      role: "MEMBER" as "QUEEN_MOTHER_VERIFIED",
    });
    expect(result).toEqual({ ok: false, code: "invalid_role" });
  });
});
