import { beforeEach, describe, expect, it, vi } from "vitest";

const platformPhase = { value: 2 as 1 | 2 | 3 };

vi.mock("@/config/platform", () => ({
  getServerPlatformPhase: () => platformPhase.value,
  platformFeatures: {
    communities: (p: number) => p >= 2,
  },
}));

vi.mock("@/lib/member/auth-api-guard", () => ({
  guardMemberAuthApi: vi.fn(),
}));

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    media: { count: vi.fn() },
    communityVerificationRequest: { findFirst: vi.fn(), create: vi.fn() },
  };
  return { mockPrisma };
});

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(),
  prisma: mockPrisma,
}));

vi.mock("@/lib/member/session", () => ({
  getMemberSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  allowPublicFormRequest: vi.fn(),
}));

vi.mock("@/lib/server/communities-access", () => ({
  findActiveCommunityBySlug: vi.fn(),
  findMembership: vi.fn(),
}));

vi.mock("@/lib/validation/communities", () => ({
  isCommunitySlug: vi.fn(),
  communityVerificationSubmitSchema: {
    safeParse: vi.fn(),
  },
}));

vi.mock("@/lib/server/community-verification-upload", () => ({
  createMediaRecordsFromVerificationFiles: vi.fn(),
}));

import { POST } from "./route";
import { createMediaRecordsFromVerificationFiles } from "@/lib/server/community-verification-upload";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { findActiveCommunityBySlug, findMembership } from "@/lib/server/communities-access";
import { communityVerificationSubmitSchema, isCommunitySlug } from "@/lib/validation/communities";

const MEDIA_ID = "cjld2cjxh0000qzrmn831i7ra";
const COMM_ID = "cjld2cjxh0000qzrmn831i7rb";
const MEMBER_ID = "cjld2cjxh0000qzrmn831i7rc";

const params = { params: Promise.resolve({ slug: "east-area" }) };

describe("POST /api/communities/[slug]/verification", () => {
  beforeEach(() => {
    platformPhase.value = 2;
    vi.mocked(isDatabaseConfigured).mockReturnValue(true);
    vi.mocked(guardMemberAuthApi).mockReturnValue(null);
    vi.mocked(allowPublicFormRequest).mockResolvedValue(true);
    vi.mocked(isCommunitySlug).mockReturnValue(true);
    vi.mocked(getMemberSession).mockResolvedValue({ memberId: MEMBER_ID, email: "member@example.com" });
    vi.mocked(findActiveCommunityBySlug).mockResolvedValue({
      id: COMM_ID,
      slug: "east-area",
      name: "East",
      description: "x",
      traditionalAreaName: null,
      joinPolicy: "OPEN",
      visibility: "PUBLIC",
      regionId: null,
    });
    vi.mocked(findMembership).mockResolvedValue({
      state: "ACTIVE",
      role: "MEMBER",
    } as Awaited<ReturnType<typeof findMembership>>);
    mockPrisma.communityVerificationRequest.findFirst.mockResolvedValue(null);
    mockPrisma.communityVerificationRequest.create.mockResolvedValue({
      id: "req1",
      status: "SUBMITTED",
      createdAt: new Date(),
    });
    mockPrisma.media.count.mockClear();
    mockPrisma.communityVerificationRequest.create.mockClear();
    mockPrisma.communityVerificationRequest.findFirst.mockClear();
    vi.mocked(createMediaRecordsFromVerificationFiles).mockReset();
    vi.mocked(communityVerificationSubmitSchema.safeParse).mockReset();
  });

  it("accepts JSON body with valid media ids", async () => {
    vi.mocked(communityVerificationSubmitSchema.safeParse).mockReturnValue({
      success: true,
      data: { documentMediaIds: [MEDIA_ID], note: "Hello" },
    } as ReturnType<typeof communityVerificationSubmitSchema.safeParse>);
    mockPrisma.media.count.mockResolvedValue(1);

    const req = new Request("http://localhost/api/communities/east-area/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentMediaIds: [MEDIA_ID], note: "Hello" }),
    });

    const res = await POST(req, params);
    expect(res.status).toBe(201);
    expect(mockPrisma.communityVerificationRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentMediaIds: [MEDIA_ID],
          reviewNotes: "Hello",
        }),
      }),
    );
    expect(createMediaRecordsFromVerificationFiles).not.toHaveBeenCalled();
  });

  it("accepts multipart with uploaded documents", async () => {
    const file = new File([Buffer.from("x")], "doc.pdf", { type: "application/pdf" });
    const fd = new FormData();
    fd.append("documents", file);
    fd.set("note", "Please review");

    vi.mocked(createMediaRecordsFromVerificationFiles).mockResolvedValue([MEDIA_ID]);

    const req = new Request("http://localhost/api/communities/east-area/verification", {
      method: "POST",
      body: fd,
    });

    const res = await POST(req, params);
    expect(res.status).toBe(201);
    expect(createMediaRecordsFromVerificationFiles).toHaveBeenCalled();
    expect(mockPrisma.media.count).not.toHaveBeenCalled();
    expect(mockPrisma.communityVerificationRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          documentMediaIds: [MEDIA_ID],
          reviewNotes: "Please review",
        }),
      }),
    );
  });

  it("returns 400 when multipart has no files and no ids", async () => {
    const fd = new FormData();
    fd.set("note", "Only a note");

    const req = new Request("http://localhost/api/communities/east-area/verification", {
      method: "POST",
      body: fd,
    });

    const res = await POST(req, params);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toMatch(/at least one document/i);
    expect(createMediaRecordsFromVerificationFiles).not.toHaveBeenCalled();
    expect(mockPrisma.communityVerificationRequest.create).not.toHaveBeenCalled();
  });
});
