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
    case "community_post_reported":
      return `A post was reported in “${String(p.communityName ?? "a community")}”.`;
    case "community_verification_approved":
      return `Your verification was approved in “${String(p.communityName ?? "a community")}”.`;
    case "community_verification_rejected":
      return `Your verification was not approved in “${String(p.communityName ?? "a community")}”.`;
    default:
      return type;
  }
}

export function memberNotificationHref(type: string, payload: unknown): string | null {
  if (type === "identity_verification_updated") return "/account";
  const p = payload as Record<string, unknown>;
  const slug = p.communitySlug;
  if (typeof slug !== "string" || !slug.trim()) return null;
  return `/communities/${slug}`;
}

export function memberNotificationLinkLabel(type: string): string {
  if (type === "identity_verification_updated") return "View account";
  return "Open community";
}
