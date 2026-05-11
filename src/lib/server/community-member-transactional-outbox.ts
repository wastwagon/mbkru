import "server-only";

import { prisma } from "@/lib/db/prisma";
import { enqueueNotificationJob } from "@/lib/server/notification-outbox";

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return "https://mbkruadvocates.org";
}

function communityTransactionalSmsEnabled(): boolean {
  const v = process.env.MBKRU_COMMUNITY_TRANSACTIONAL_SMS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

async function enqueueMemberTransactionalEmail(args: {
  memberId: string;
  subject: string;
  text: string;
  tag: string;
}): Promise<void> {
  const m = await prisma.member.findUnique({
    where: { id: args.memberId },
    select: { email: true },
  });
  if (!m?.email) return;
  await enqueueNotificationJob({
    channel: "EMAIL",
    kind: "MEMBER_TRANSACTIONAL_EMAIL",
    payload: { to: m.email, subject: args.subject, text: args.text, tag: args.tag },
  });
}

async function enqueueMemberTransactionalSmsIfEnabled(args: {
  memberId: string;
  body: string;
  tag: string;
}): Promise<void> {
  if (!communityTransactionalSmsEnabled()) return;
  const m = await prisma.member.findUnique({
    where: { id: args.memberId },
    select: { phone: true },
  });
  const phone = m?.phone?.trim();
  if (!phone?.startsWith("+")) return;
  const body = args.body.trim().slice(0, 1200);
  if (!body) return;
  await enqueueNotificationJob({
    channel: "SMS",
    kind: "MEMBER_TRANSACTIONAL_SMS",
    payload: { to: phone, body, tag: args.tag },
  });
}

export async function enqueueCommunityJoinApprovedDelivery(
  memberId: string,
  communityName: string,
  communitySlug: string,
): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(communitySlug)}`;
  const subject = `[MBKRU] Approved: ${communityName}`;
  const text =
    `Your request to join "${communityName}" on MBKRU was approved.\n\n` +
    `Open the community: ${base}${path}\n`;
  await enqueueMemberTransactionalEmail({
    memberId,
    subject,
    text,
    tag: "community_join_approved",
  });
  await enqueueMemberTransactionalSmsIfEnabled({
    memberId,
    body: `MBKRU: You're in "${communityName}". ${base}${path}`,
    tag: "community_join_approved",
  });
}

export async function enqueueCommunityPostPublishedDelivery(
  memberId: string,
  postId: string,
  communitySlug: string,
): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(communitySlug)}/post/${postId}`;
  const subject = `[MBKRU] Your community post was published`;
  const text =
    `A moderator published your post in ${communitySlug}.\n\n` + `View it: ${base}${path}\n`;
  await enqueueMemberTransactionalEmail({ memberId, subject, text, tag: "community_post_published" });
  await enqueueMemberTransactionalSmsIfEnabled({
    memberId,
    body: `MBKRU: Your post in ${communitySlug} is live. ${base}${path}`,
    tag: "community_post_published",
  });
}

export async function enqueueCommunityPostRejectedDelivery(
  memberId: string,
  postId: string,
  communitySlug: string,
  reason: string | null,
): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(communitySlug)}/post/${postId}`;
  const subject = `[MBKRU] Community post update`;
  const reasonBlock = reason?.trim() ? `\nNote from moderators: ${reason.trim()}\n` : "";
  const text =
    `Your post in ${communitySlug} was not published.${reasonBlock}\n` + `Open the draft thread: ${base}${path}\n`;
  await enqueueMemberTransactionalEmail({ memberId, subject, text, tag: "community_post_rejected" });
  await enqueueMemberTransactionalSmsIfEnabled({
    memberId,
    body: `MBKRU: Post in ${communitySlug} not published.${reason?.trim() ? ` ${reason.trim().slice(0, 120)}` : ""}`,
    tag: "community_post_rejected",
  });
}

export async function enqueueCommunityVerificationOutcomeDelivery(
  memberId: string,
  approved: boolean,
  communityName: string,
  communitySlug: string,
  notes: string | null,
): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(communitySlug)}`;
  const subject = approved
    ? `[MBKRU] Queen Mother verification approved — ${communityName}`
    : `[MBKRU] Queen Mother verification update — ${communityName}`;
  const notesBlock = notes?.trim() ? `\nNote: ${notes.trim()}\n` : "";
  const text = approved
    ? `Your Queen Mother verification for "${communityName}" was approved.${notesBlock}\nCommunity: ${base}${path}\n`
    : `Your Queen Mother verification for "${communityName}" was not approved.${notesBlock}\nCommunity: ${base}${path}\n`;
  await enqueueMemberTransactionalEmail({
    memberId,
    subject,
    text,
    tag: approved ? "community_verification_approved" : "community_verification_rejected",
  });
  await enqueueMemberTransactionalSmsIfEnabled({
    memberId,
    body: approved
      ? `MBKRU: Queen Mother verification approved for ${communityName}.`
      : `MBKRU: Queen Mother verification not approved for ${communityName}.`,
    tag: approved ? "community_verification_approved" : "community_verification_rejected",
  });
}

export async function enqueueCommunityThreadReplyDelivery(
  recipientMemberId: string,
  communityName: string,
  communitySlug: string,
  threadPostId: string,
): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(communitySlug)}/post/${threadPostId}`;
  const subject = `[MBKRU] New reply in ${communityName}`;
  const text =
    `Someone replied to your thread in "${communityName}".\n\n` + `Open the thread: ${base}${path}\n`;
  await enqueueMemberTransactionalEmail({
    memberId: recipientMemberId,
    subject,
    text,
    tag: "community_thread_reply",
  });
  await enqueueMemberTransactionalSmsIfEnabled({
    memberId: recipientMemberId,
    body: `MBKRU: New reply in ${communityName}. ${base}${path}`,
    tag: "community_thread_reply",
  });
}
