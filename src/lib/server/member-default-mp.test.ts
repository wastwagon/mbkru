import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    member: { findUnique: vi.fn() },
    parliamentMember: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/lib/db/prisma";
import { findDefaultMpForConstituency, findDefaultMpForMember } from "@/lib/server/member-default-mp";

describe("member-default-mp", () => {
  it("returns null without constituency", async () => {
    expect(await findDefaultMpForConstituency(null)).toBeNull();
    expect(await findDefaultMpForConstituency(undefined)).toBeNull();
  });

  it("finds MP for constituency", async () => {
    vi.mocked(prisma.parliamentMember.findFirst).mockResolvedValue({
      id: "mp1",
      name: "Hon. Test",
      slug: "hon-test",
    } as never);
    const mp = await findDefaultMpForConstituency("const1");
    expect(mp?.id).toBe("mp1");
  });

  it("resolves member constituency then MP", async () => {
    vi.mocked(prisma.member.findUnique).mockResolvedValue({ constituencyId: "const1" } as never);
    vi.mocked(prisma.parliamentMember.findFirst).mockResolvedValue({
      id: "mp2",
      name: "Hon. Two",
      slug: "hon-two",
    } as never);
    const mp = await findDefaultMpForMember("mem1");
    expect(mp?.slug).toBe("hon-two");
  });
});
