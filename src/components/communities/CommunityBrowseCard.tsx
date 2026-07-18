import Image from "next/image";
import Link from "next/link";

import { CommunityQueenMotherBadge } from "@/components/communities/CommunityQueenMotherBadge";
import { QueenMotherPortraitStack } from "@/components/communities/CommunityQueenMotherRoster";
import { focusRingSmClass, primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

export type CommunityCoverProps = {
  storagePath: string;
  alt: string | null;
} | null;

export type QueenMotherPortraitPreview = {
  storagePath: string;
  alt: string | null;
  name: string;
};

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
  queenMotherPortraits?: QueenMotherPortraitPreview[];
  cover?: CommunityCoverProps;
};

function communityInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "C"
  );
}

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
  queenMotherPortraits = [],
  cover = null,
}: CommunityBrowseCardProps) {
  const communityHref = `/communities/${slug}`;
  const joinHref = `${communityHref}#join`;
  const joinLabel = joinPolicy === "OPEN" ? "Join now" : "Request to join";
  const joinButtonClass =
    joinPolicy === "OPEN"
      ? `inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`
      : `inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--section-light)] sm:w-auto ${focusRingSmClass}`;

  const metaParts: string[] = [];
  if (region) metaParts.push(region.name);
  if (typeof memberCount === "number") metaParts.push(`${memberCount} members`);
  metaParts.push(joinPolicy === "OPEN" ? "Open to join" : "Approval required");

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
      <div className="flex flex-wrap items-start gap-3">
        {cover ? (
          <span className="relative inline-block h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--section-light)]">
            <Image
              src={cover.storagePath}
              alt={cover.alt || `${name} cover`}
              fill
              className="object-cover"
              sizes="48px"
            />
          </span>
        ) : (
          <span
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--section-light)] text-sm font-bold text-[var(--primary)]"
            aria-hidden
          >
            {communityInitials(name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug sm:text-lg">
              <Link href={communityHref} className="text-[var(--foreground)] hover:text-[var(--primary)]">
                {name}
              </Link>
            </h3>
            {verifiedQueenMotherCount > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <QueenMotherPortraitStack portraits={queenMotherPortraits} count={verifiedQueenMotherCount} />
                <CommunityQueenMotherBadge />
              </div>
            ) : null}
            {visibility === "MEMBERS_ONLY" ? (
              <span className="rounded-full bg-[var(--section-light-alt)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--foreground-secondary)]">
                Members only
              </span>
            ) : null}
          </div>

          {traditionalAreaName ? (
            <p className="mt-1.5 text-sm text-[var(--foreground-secondary)]">{traditionalAreaName}</p>
          ) : null}

          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>

          {visibility === "MEMBERS_ONLY" ? (
            <p className="mt-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
              Sign in on the community page to read posts.
            </p>
          ) : description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">{description}</p>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav
              className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[var(--foreground-secondary)]"
              aria-label={`Links for ${name}`}
            >
              <Link href={communityHref} className={primaryNavLinkClass}>
                Overview
              </Link>
              <Link href={`/communities/${slug}/portal`} className={primaryLinkClass}>
                Workspace
              </Link>
              <Link href={`/communities/${slug}/forums`} className={primaryNavLinkClass}>
                Forums
              </Link>
            </nav>
            <Link href={joinHref} className={joinButtonClass}>
              {joinLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
