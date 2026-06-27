import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    member: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    citizenReport: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/server/hubtel-ghana-card-config", () => ({
  mpSubmitRequiresGhanaCard: vi.fn(() => true),
  mpPerformanceCooldownDays: vi.fn(() => 30),
  isHubtelGhanaCardConfigured: vi.fn(() => true),
  getHubtelGhanaCardConfig: vi.fn(),
}));

vi.mock("@/lib/server/hubtel-ghana-card-verify", () => ({
  verifyGhanaCardWithHubtel: vi.fn(),
}));

import { prisma } from "@/lib/db/prisma";
import { assertMpPerformanceSubmitAllowed } from "@/lib/server/member-ghana-card";
import { mpSubmitRequiresGhanaCard } from "@/lib/server/hubtel-ghana-card-config";

describe("assertMpPerformanceSubmitAllowed", () => {
  beforeEach(() => {
    vi.mocked(mpSubmitRequiresGhanaCard).mockReturnValue(true);
    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      ghanaCardVerificationStatus: "VERIFIED",
    } as never);
    vi.mocked(prisma.citizenReport.findFirst).mockResolvedValue(null);
  });

  it("blocks when Ghana Card not verified", async () => {
    vi.mocked(prisma.member.findUnique).mockResolvedValue({
      ghanaCardVerificationStatus: "UNVERIFIED",
    } as never);
    const r = await assertMpPerformanceSubmitAllowed("mem1", "mp1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("GHANA_CARD_REQUIRED");
  });

  it("blocks when recent MP report exists", async () => {
    vi.mocked(prisma.citizenReport.findFirst).mockResolvedValue({
      createdAt: new Date(),
      trackingCode: "ABC",
    } as never);
    const r = await assertMpPerformanceSubmitAllowed("mem1", "mp1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe("MP_REPORT_COOLDOWN");
  });

  it("allows verified member without recent report", async () => {
    const r = await assertMpPerformanceSubmitAllowed("mem1", "mp1");
    expect(r.ok).toBe(true);
  });
});
