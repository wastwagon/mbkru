import Link from "next/link";

import { ReportCommunityPostButton } from "@/components/communities/ReportCommunityPostButton";
import { isThreadActivityBumped } from "@/lib/community-thread-ui";
import { focusRingSmClass } from "@/lib/primary-link-styles";

export type CommunityThreadCardPost = {
  id: string;
  kind: string;
  title: string | null;
  body: string;
  moderationStatus: string;
  pinned: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  author: { id: string; displayName: string | null };
  communityForum?: { slug: string; name: string } | null;
  _count?: { replies: number };
};

type Props = {
  communitySlug: string;
  post: CommunityThreadCardPost;
  viewerMemberId: string | null;
  /** When true, show forum slug badge (community-wide feed). */
  showForumBadge?: boolean;
};

export function CommunityThreadCard({ communitySlug, post, viewerMemberId, showForumBadge }: Props) {
  const replyCount = post._count?.replies ?? 0;
  const bumped = isThreadActivityBumped(post.createdAt, post.lastActivityAt);
  const threadHref = `/communities/${communitySlug}/post/${post.id}`;

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--foreground-secondary)]">
        {showForumBadge && post.communityForum ? (
          <>
            <span className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/8 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--primary-dark)]">
              {post.communityForum.slug}
            </span>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <span className="font-semibold uppercase tracking-wide text-[var(--foreground)]">{post.kind}</span>
        <span aria-hidden>·</span>
        <span>{post.author.displayName ?? "Member"}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.createdAt.toISOString()}>
          {post.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </time>
        {post.moderationStatus !== "PUBLISHED" ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
            {post.moderationStatus.toLowerCase()}
          </span>
        ) : null}
        {post.pinned ? (
          <span className="rounded-full bg-[var(--accent-gold-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-gold)]">
            Pinned
          </span>
        ) : null}
        {replyCount > 0 ? (
          <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary-dark)]">
            {replyCount} repl{replyCount === 1 ? "y" : "ies"}
          </span>
        ) : null}
        {bumped ? (
          <span className="text-[10px] font-medium text-[var(--primary)]">
            · Active{" "}
            <time dateTime={post.lastActivityAt.toISOString()}>
              {post.lastActivityAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </time>
          </span>
        ) : null}
      </div>
      {post.title ? (
        <h3 className="mt-2 text-base font-semibold leading-snug text-[var(--foreground)]">
          <Link href={threadHref} className="hover:text-[var(--primary)]">
            {post.title}
          </Link>
        </h3>
      ) : null}
      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground-secondary)]">
        {post.body}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ReportCommunityPostButton
          communitySlug={communitySlug}
          postId={post.id}
          authorMemberId={post.author.id}
          viewerMemberId={viewerMemberId}
        />
        <Link
          href={threadHref}
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
        >
          Open thread
        </Link>
      </div>
    </li>
  );
}
