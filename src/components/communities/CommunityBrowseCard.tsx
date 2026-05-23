import Link from "next/link";

import { CommunityQueenMotherBadge } from "@/components/communities/CommunityQueenMotherBadge";
import { focusRingSmClass, primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

export type CommunityBrowseCardProps = {
  slug: string;
  name: string;
  description: string | null;
  traditionalAreaName: string | null;
  region: { name: string; slug: string } | null;
  visibility: "PUBLIC" | "MEMBERS_ONLY";
  joinPolicy: "OPEN" | "APPROVAL_REQUIRED";
  memberCount?: number;
  verifiedQueenMotherCount?: number;
};

export function CommunityBrowseCard({
  slug,
  name,
  description,
  traditionalAreaName,
  region,
  visibility,
  joinPolicy,
  memberCount,
  verifiedQueenMotherCount = 0,
}: CommunityBrowseCardProps) {
  const joinHref = `/communities/${encodeURIComponent(slug)}#join`;
  const joinLabel = joinPolicy === "OPEN" ? "Join now" : "Request to join";
  const joinButtonClass =
    joinPolicy === "OPEN"
      ? `inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingSmClass}`
      : `inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <Link href={`/communities/${slug}`} className="block min-w-0 flex-1">
          <span className="font-semibold text-[var(--foreground)]">{name}</span>
          {verifiedQueenMotherCount > 0 ? (
            <span className="ml-2">
              <CommunityQueenMotherBadge />
            </span>
          ) : null}
          {visibility === "MEMBERS_ONLY" ? (
            <span className="ml-2 rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--foreground)]">
              Members only
            </span>
          ) : null}
          {traditionalAreaName ? (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{traditionalAreaName}</p>
          ) : null}
          {region ? (
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {region.name}
              {typeof memberCount === "number" ? (
                <span className="ml-2 tabular-nums">· {memberCount} members</span>
              ) : null}
            </p>
          ) : null}
          {visibility === "MEMBERS_ONLY" ? (
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Members-only community — sign in on the community page to read details and posts.
            </p>
          ) : (
            <p className="mt-2 line-clamp-3 text-sm text-[var(--muted-foreground)]">{description}</p>
          )}
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Join: {joinPolicy === "OPEN" ? "Open" : "Approval required"}
          </p>
        </Link>
        <Link href={joinHref} className={joinButtonClass}>
          {joinLabel}
        </Link>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-[var(--border)] pt-3 text-xs font-medium">
        <Link href={`/communities/${slug}`} className={primaryNavLinkClass}>
          Overview
        </Link>
        <Link href={`/communities/${slug}/portal`} className={primaryLinkClass}>
          Council workspace
        </Link>
        <Link href={`/communities/${slug}/forums`} className={primaryNavLinkClass}>
          Forums &amp; threads
        </Link>
      </p>
    </div>
  );
}
