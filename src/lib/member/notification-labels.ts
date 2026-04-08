/** Human-readable copy for in-app notification rows (client-safe). */

export function memberNotificationSummary(type: string, payload: unknown): string {
  const p = payload as Record<string, unknown>;
  switch (type) {
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
  const p = payload as Record<string, unknown>;
  const slug = p.communitySlug;
  if (typeof slug !== "string" || !slug.trim()) return null;
  return `/communities/${slug}`;
}
