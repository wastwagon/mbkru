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

/**
 * Email/SMS (when enabled) to moderators / verified Queen Mothers — excludes the reporter
 * so they are not notified about their own report.
 */
export async function enqueueCommunityPostReportModeratorDelivery(args: {
  moderatorMemberIds: string[];
  communityName: string;
  communitySlug: string;
  postId: string;
  reason: string;
}): Promise<void> {
  const base = siteOrigin();
  const path = `/communities/${encodeURIComponent(args.communitySlug)}/post/${args.postId}`;
  const subject = `[MBKRU] Post reported — ${args.communityName}`;
  const text =
    `A member reported a post in "${args.communityName}".\n\n` +
    `Reason (category): ${args.reason}\n\n` +
    `Open the thread: ${base}${path}\n\n` +
    `Community management: ${base}/communities/${encodeURIComponent(args.communitySlug)}/manage\n`;
  const smsBody = `MBKRU: Post reported in ${args.communityName}. ${base}${path}`.slice(0, 300);
  for (const memberId of args.moderatorMemberIds) {
    await enqueueMemberTransactionalEmail({
      memberId,
      subject,
      text,
      tag: "community_post_reported_moderator",
    });
    await enqueueMemberTransactionalSmsIfEnabled({
      memberId,
      body: smsBody,
      tag: "community_post_reported_moderator",
    });
  }
}

function stewardRoleLabel(role: string): string {
  if (role === "QUEEN_MOTHER_VERIFIED") return "Queen Mother (verified)";
  if (role === "MODERATOR") return "Moderator";
  return role;
}

/** One-time login credentials for a community steward provisioned by MBKRU admin. */
export async function enqueueCommunityStewardCredentialsDelivery(args: {
  memberId: string;
  communityName: string;
  communitySlug: string;
  email: string;
  password: string;
  role: string;
  createdMember: boolean;
}): Promise<void> {
  const base = siteOrigin();
  const loginUrl = `${base}/login`;
  const portalUrl = `${base}/communities/${encodeURIComponent(args.communitySlug)}/portal`;
  const manageUrl = `${base}/communities/${encodeURIComponent(args.communitySlug)}/manage`;
  const roleLabel = stewardRoleLabel(args.role);
  const subject = `[MBKRU] Your ${roleLabel} access — ${args.communityName}`;
  const accountLine = args.createdMember
    ? "A new MBKRU member account was created for you."
    : "Your existing MBKRU member password was reset for this community.";
  const text = [
    `Hello,`,
    ``,
    `You have been set up as ${roleLabel} for "${args.communityName}" on MBKRU.`,
    accountLine,
    ``,
    `Sign in: ${loginUrl}`,
    `Email: ${args.email}`,
    `Temporary password: ${args.password}`,
    ``,
    `Council workspace: ${portalUrl}`,
    `Community management: ${manageUrl}`,
    ``,
    `After signing in, change your password under Account → Password, or use Forgot password on the sign-in page.`,
    ``,
    `Please keep these details private.`,
    ``,
    `— MBKRU`,
  ].join("\n");

  await enqueueMemberTransactionalEmail({
    memberId: args.memberId,
    subject,
    text,
    tag: "community_steward_credentials",
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
