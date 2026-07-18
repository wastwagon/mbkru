import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath,
}));

const requireAdminSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin/require-session", () => ({
  requireAdminSession,
}));

const publishPendingCommunityPost = vi.hoisted(() => vi.fn());
const rejectPendingCommunityPost = vi.hoisted(() => vi.fn());
const revalidateCommunityModerationPaths = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/community-moderation-ops", () => ({
  approvePendingCommunityMembership: vi.fn(),
  publishPendingCommunityPost,
  rejectPendingCommunityPost,
  revalidateCommunityModerationPaths,
  setCommunityMembershipBannedState: vi.fn(),
  updateCommunityPostReportStatus: vi.fn(),
}));

vi.mock("@/lib/server/community-steward-provision", () => ({
  provisionCommunitySteward: vi.fn(),
}));

vi.mock("@/lib/server/admin-operational-audit", () => ({
  logAdminOperationalAudit: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const { prisma } = vi.hoisted(() => {
  const prisma = {
    communityMembership: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    community: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    media: {
      findUnique: vi.fn(),
    },
  };
  return { prisma };
});

vi.mock("@/lib/db/prisma", () => ({
  prisma,
}));

import {
  publishCommunityPostAction,
  rejectCommunityPostAction,
  setCommunityMembershipStateAction,
  updateCommunityCoverAction,
} from "./actions";

const COMM = "cjld2cjxh0000qzrmn831i7ra";
const POST = "cjld2cjxh0000qzrmn831i7rb";
const MEM = "cjld2cjxh0000qzrmn831i7rc";
const ADMIN = "cjld2cjxh0000qzrmn831i7rd";
const MEDIA = "cjld2cjxh0000qzrmn831i7re";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

describe("admin communities actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdminSession).mockResolvedValue({ adminId: ADMIN });
    prisma.community.findUnique.mockResolvedValue({ slug: "east-area" });
  });

  describe("publishCommunityPostAction", () => {
    it("publishes pending post via moderation ops", async () => {
      publishPendingCommunityPost.mockResolvedValue({
        ok: true,
        communitySlug: "east-area",
        parentPostId: null,
      });

      await publishCommunityPostAction(fd({ postId: POST, communityId: COMM }));

      expect(publishPendingCommunityPost).toHaveBeenCalledWith(POST, COMM, ADMIN);
      expect(revalidateCommunityModerationPaths).toHaveBeenCalledWith(COMM, "east-area", {
        revalidatePath,
        postId: POST,
        parentPostId: null,
      });
    });

    it("no-ops when moderation ops returns false", async () => {
      publishPendingCommunityPost.mockResolvedValue({ ok: false });

      await publishCommunityPostAction(fd({ postId: POST, communityId: COMM }));

      expect(revalidateCommunityModerationPaths).not.toHaveBeenCalled();
    });
  });

  describe("rejectCommunityPostAction", () => {
    it("rejects via moderation ops", async () => {
      rejectPendingCommunityPost.mockResolvedValue({ ok: true, communitySlug: "east-area" });

      await rejectCommunityPostAction(
        fd({ postId: POST, communityId: COMM, reason: "Off-topic" }),
      );

      expect(rejectPendingCommunityPost).toHaveBeenCalledWith(POST, COMM, "Off-topic", ADMIN);
      expect(revalidateCommunityModerationPaths).toHaveBeenCalled();
    });
  });

  describe("setCommunityMembershipStateAction", () => {
    it("bans member with reason", async () => {
      prisma.communityMembership.findFirst.mockResolvedValue({ id: MEM });

      await setCommunityMembershipStateAction(
        fd({
          membershipId: MEM,
          communityId: COMM,
          state: "BANNED",
          banReason: "spam",
        }),
      );

      expect(prisma.communityMembership.update).toHaveBeenCalledWith({
        where: { id: MEM },
        data: {
          state: "BANNED",
          banReason: "spam",
          bannedAt: expect.any(Date),
        },
      });
    });

    it("unban clears ban fields", async () => {
      prisma.communityMembership.findFirst.mockResolvedValue({ id: MEM });

      await setCommunityMembershipStateAction(
        fd({ membershipId: MEM, communityId: COMM, state: "ACTIVE" }),
      );

      expect(prisma.communityMembership.update).toHaveBeenCalledWith({
        where: { id: MEM },
        data: {
          state: "ACTIVE",
          banReason: null,
          bannedAt: null,
        },
      });
    });
  });

  describe("updateCommunityCoverAction", () => {
    it("assigns a public image cover and revalidates paths", async () => {
      prisma.community.findUnique.mockResolvedValue({
        id: COMM,
        slug: "east-area",
        region: { slug: "ashanti" },
      });
      prisma.media.findUnique.mockResolvedValue({
        visibility: "PUBLIC",
        mimeType: "image/jpeg",
      });

      await updateCommunityCoverAction(fd({ communityId: COMM, coverMediaId: MEDIA }));

      expect(prisma.community.update).toHaveBeenCalledWith({
        where: { id: COMM },
        data: { coverMediaId: MEDIA },
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/communities/${COMM}`);
      expect(revalidatePath).toHaveBeenCalledWith("/communities");
      expect(revalidatePath).toHaveBeenCalledWith("/communities/east-area");
      expect(revalidatePath).toHaveBeenCalledWith("/regions/ashanti");
    });

    it("clears cover when coverMediaId is empty", async () => {
      prisma.community.findUnique.mockResolvedValue({
        id: COMM,
        slug: "east-area",
        region: null,
      });

      await updateCommunityCoverAction(fd({ communityId: COMM, coverMediaId: "" }));

      expect(prisma.media.findUnique).not.toHaveBeenCalled();
      expect(prisma.community.update).toHaveBeenCalledWith({
        where: { id: COMM },
        data: { coverMediaId: null },
      });
    });

    it("rejects private or non-image media", async () => {
      prisma.community.findUnique.mockResolvedValue({
        id: COMM,
        slug: "east-area",
        region: null,
      });
      prisma.media.findUnique.mockResolvedValue({
        visibility: "PRIVATE",
        mimeType: "image/jpeg",
      });

      await updateCommunityCoverAction(fd({ communityId: COMM, coverMediaId: MEDIA }));

      expect(prisma.community.update).not.toHaveBeenCalled();
    });
  });
});
