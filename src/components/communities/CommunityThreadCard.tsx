import Link from "next/link";

import { ReportCommunityPostButton } from "@/components/communities/ReportCommunityPostButton";
import { isThreadActivityBumped } from "@/lib/community-thread-ui";
import { primaryLinkClass } from "@/lib/primary-link-styles";

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

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
        {showForumBadge && post.communityForum ? (
          <>
            <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-[var(--foreground)]">
              {post.communityForum.slug}
            </span>
            <span>·</span>
          </>
        ) : null}
        <span className="font-medium uppercase tracking-wide text-[var(--foreground)]">{post.kind}</span>
        <span>·</span>
        <span>{post.author.displayName ?? "Member"}</span>
        <span>·</span>
        <time dateTime={post.createdAt.toISOString()}>
          {post.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </time>
        {post.moderationStatus !== "PUBLISHED" ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
            {post.moderationStatus.toLowerCase()}
          </span>
        ) : null}
        {post.pinned ? (
          <span className="rounded-full bg-[var(--section-light)] px-2 py-0.5 text-[10px] font-semibold uppercase">
            Pinned
          </span>
        ) : null}
        {replyCount > 0 ? (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-900">
            {replyCount} repl{replyCount === 1 ? "y" : "ies"}
          </span>
        ) : null}
        {bumped ? (
          <span className="text-[10px] font-medium text-sky-800">
            · Active{" "}
            <time dateTime={post.lastActivityAt.toISOString()}>
              {post.lastActivityAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </time>
          </span>
        ) : null}
      </div>
      {post.title ? (
        <p className="mt-2 font-display text-base font-semibold text-[var(--foreground)]">{post.title}</p>
      ) : null}
      <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--foreground)]">{post.body}</p>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <Link href={`/communities/${communitySlug}/post/${post.id}`} className={primaryLinkClass}>
          Open thread
        </Link>
      </p>
      <ReportCommunityPostButton
        communitySlug={communitySlug}
        postId={post.id}
        authorMemberId={post.author.id}
        viewerMemberId={viewerMemberId}
      />
    </li>
  );
}
