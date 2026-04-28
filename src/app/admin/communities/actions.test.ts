import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath,
}));

const createMemberNotification = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/member-notifications", () => ({
  createMemberNotification,
}));

const notifyThreadAuthorOfPublishedReply = vi.hoisted(() => vi.fn());
const bumpThreadRootAfterReplyPublished = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/community-thread-reply-notify", () => ({
  notifyThreadAuthorOfPublishedReply,
  bumpThreadRootAfterReplyPublished,
}));

const requireAdminSession = vi.hoisted(() => vi.fn());

vi.mock("@/lib/admin/require-session", () => ({
  requireAdminSession,
}));

const { prisma } = vi.hoisted(() => {
  const prisma = {
    communityPost: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    communityMembership: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    community: {
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
} from "./actions";

const COMM = "cjld2cjxh0000qzrmn831i7ra";
const POST = "cjld2cjxh0000qzrmn831i7rb";
const MEM = "cjld2cjxh0000qzrmn831i7rc";
const ADMIN = "cjld2cjxh0000qzrmn831i7rd";

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
    it("publishes pending post and notifies author", async () => {
      prisma.communityPost.findFirst.mockResolvedValue({
        id: POST,
        authorMemberId: MEM,
        parentPostId: null,
        community: { slug: "east-area", name: "East Area" },
      });
      prisma.communityPost.update.mockResolvedValue({});

      await publishCommunityPostAction(fd({ postId: POST, communityId: COMM }));

      expect(prisma.communityPost.update).toHaveBeenCalledWith({
        where: { id: POST },
        data: {
          moderationStatus: "PUBLISHED",
          moderatedAt: expect.any(Date),
          moderatedByAdminId: ADMIN,
        },
      });
      expect(createMemberNotification).toHaveBeenCalledWith(MEM, "community_post_published", {
        postId: POST,
        communitySlug: "east-area",
      });
      expect(revalidatePath).toHaveBeenCalledWith(`/admin/communities/${COMM}`);
      expect(revalidatePath).toHaveBeenCalledWith("/admin/communities/moderation");
      expect(revalidatePath).toHaveBeenCalledWith("/communities/east-area");
      expect(revalidatePath).toHaveBeenCalledWith(`/communities/east-area/post/${POST}`);
      expect(notifyThreadAuthorOfPublishedReply).toHaveBeenCalledWith({
        replyPostId: POST,
        replyAuthorMemberId: MEM,
        communitySlug: "east-area",
        communityName: "East Area",
        parentPostId: null,
      });
      expect(bumpThreadRootAfterReplyPublished).not.toHaveBeenCalled();
    });

    it("publishes pending reply and bumps root thread activity", async () => {
      const ROOT = "cjld2cjxh0000qzrmn831i7re";
      prisma.communityPost.findFirst.mockResolvedValue({
        id: POST,
        authorMemberId: MEM,
        parentPostId: ROOT,
        community: { slug: "east-area", name: "East Area" },
      });
      prisma.communityPost.update.mockResolvedValue({});

      await publishCommunityPostAction(fd({ postId: POST, communityId: COMM }));

      expect(bumpThreadRootAfterReplyPublished).toHaveBeenCalledWith(ROOT);
      expect(notifyThreadAuthorOfPublishedReply).toHaveBeenCalledWith({
        replyPostId: POST,
        replyAuthorMemberId: MEM,
        communitySlug: "east-area",
        communityName: "East Area",
        parentPostId: ROOT,
      });
    });

    it("no-ops when post is missing", async () => {
      prisma.communityPost.findFirst.mockResolvedValue(null);

      await publishCommunityPostAction(fd({ postId: POST, communityId: COMM }));

      expect(prisma.communityPost.update).not.toHaveBeenCalled();
      expect(createMemberNotification).not.toHaveBeenCalled();
      expect(notifyThreadAuthorOfPublishedReply).not.toHaveBeenCalled();
      expect(bumpThreadRootAfterReplyPublished).not.toHaveBeenCalled();
    });
  });

  describe("rejectCommunityPostAction", () => {
    it("rejects with reason and notifies", async () => {
      prisma.communityPost.findFirst.mockResolvedValue({
        id: POST,
        authorMemberId: MEM,
        community: { slug: "east-area" },
      });

      await rejectCommunityPostAction(
        fd({ postId: POST, communityId: COMM, reason: "Off-topic" }),
      );

      expect(prisma.communityPost.update).toHaveBeenCalledWith({
        where: { id: POST },
        data: {
          moderationStatus: "REJECTED",
          moderatedAt: expect.any(Date),
          moderatedByAdminId: ADMIN,
          rejectionReason: "Off-topic",
        },
      });
      expect(createMemberNotification).toHaveBeenCalledWith(MEM, "community_post_rejected", {
        postId: POST,
        communitySlug: "east-area",
        reason: "Off-topic",
      });
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
});
