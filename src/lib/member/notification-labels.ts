import type { MemberIdentityVerificationStatus } from "@prisma/client";

import { memberIdentityStatusLabel } from "@/lib/member-identity-labels";

/** Human-readable copy for in-app notification rows (client-safe). */

export function memberNotificationSummary(type: string, payload: unknown): string {
  const p = payload as Record<string, unknown>;
  switch (type) {
    case "identity_verification_updated": {
      const next = p.status as MemberIdentityVerificationStatus;
      const prev = p.previousStatus as MemberIdentityVerificationStatus | undefined;
      const nextLabel = memberIdentityStatusLabel(next);
      if (prev && prev !== next) {
        return `Your membership verification changed from ${memberIdentityStatusLabel(prev)} to ${nextLabel}.`;
      }
      return `Your membership verification status is now ${nextLabel}.`;
    }
    case "community_join_approved":
      return `You were approved in “${String(p.communityName ?? "a community")}”.`;
    case "community_post_published":
      return "Your community post was published.";
    case "community_post_rejected":
      return "Your community post was not published.";
    case "community_thread_reply":
      return `Someone replied to your thread in “${String(p.communityName ?? "a community")}”.`;
    case "community_post_reported":
      return `A post was reported in “${String(p.communityName ?? "a community")}”.`;
    case "community_verification_approved":
      return `Your verification was approved in “${String(p.communityName ?? "a community")}”.`;
    case "community_verification_rejected":
      return `Your verification was not approved in “${String(p.communityName ?? "a community")}”.`;
    case "citizen_report_admin_reply": {
      const code = String(p.trackingCode ?? "").trim();
      return code
        ? `MBKRU added a note to your report ${code}.`
        : "MBKRU added a note to one of your reports.";
    }
    case "citizen_report_admin_reply_visible_again": {
      const code = String(p.trackingCode ?? "").trim();
      return code
        ? `A team note on your report ${code} is visible again (My reports / Track a report).`
        : "A team note on one of your reports is visible again.";
    }
    default:
      return type;
  }
}

export function memberNotificationHref(type: string, payload: unknown): string | null {
  if (type === "identity_verification_updated") return "/account";
  if (type === "community_thread_reply") {
    const p = payload as Record<string, unknown>;
    const slug = typeof p.communitySlug === "string" ? p.communitySlug.trim() : "";
    const tid = typeof p.threadPostId === "string" ? p.threadPostId.trim() : "";
    if (slug && tid) return `/communities/${slug}/post/${tid}`;
    return null;
  }
  if (type === "community_post_published" || type === "community_post_rejected") {
    const p = payload as Record<string, unknown>;
    const slug = typeof p.communitySlug === "string" ? p.communitySlug.trim() : "";
    const pid = typeof p.postId === "string" ? p.postId.trim() : "";
    if (slug && pid) return `/communities/${slug}/post/${pid}`;
    return null;
  }
  if (type === "community_post_reported") {
    const p = payload as Record<string, unknown>;
    const slug = typeof p.communitySlug === "string" ? p.communitySlug.trim() : "";
    const pid = typeof p.postId === "string" ? p.postId.trim() : "";
    if (slug && pid) return `/communities/${slug}/post/${pid}`;
    return null;
  }
  if (type === "citizen_report_admin_reply" || type === "citizen_report_admin_reply_visible_again") {
    const p = payload as Record<string, unknown>;
    const rid = p.reportId;
    if (typeof rid === "string" && rid.trim()) return `/account/reports/${rid}`;
    return "/account/reports";
  }
  const p = payload as Record<string, unknown>;
  const slug = p.communitySlug;
  if (typeof slug !== "string" || !slug.trim()) return null;
  return `/communities/${slug}`;
}

export function memberNotificationLinkLabel(type: string): string {
  if (type === "identity_verification_updated") return "View account";
  if (type === "community_thread_reply") return "View thread";
  if (
    type === "community_post_published" ||
    type === "community_post_rejected" ||
    type === "community_post_reported"
  ) {
    return "View post";
  }
  if (type === "citizen_report_admin_reply" || type === "citizen_report_admin_reply_visible_again") {
    return "View report";
  }
  return "Open community";
}
