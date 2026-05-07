import Link from "next/link";

import {
  publishCommunityPostAction,
  rejectCommunityPostAction,
} from "@/app/admin/communities/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminCommunityPostsModerationPage() {
  await requireAdminSession();

  const pendingPosts = await prisma.communityPost.findMany({
    where: { moderationStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      community: { select: { id: true, name: true, slug: true } },
      author: { select: { email: true, displayName: true } },
    },
    take: 200,
  });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        showDashboardBack={false}
        title="Community posts — global queue"
        backSlot={
          <>
            <Link href="/admin/communities" className={primaryLinkClass}>
              ← Communities
            </Link>
            {" · "}
            <Link href="/admin" className={primaryLinkClass}>
              Dashboard
            </Link>
          </>
        }
        description={
          <p>
            Pending posts across all communities, oldest first. Publishing or rejecting also updates the community page
            and the post permalink. Rows use{" "}
            <code className="rounded bg-[var(--section-light)] px-1 font-mono text-xs">#mod-post-</code>
            plus the post id (from “View permalink”) so you can share a direct link to one queue item.
          </p>
        }
      />

      {pendingPosts.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">No posts awaiting moderation.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {pendingPosts.map((p) => (
            <li id={`mod-post-${p.id}`} key={p.id} className="rounded-xl border border-[var(--border)] bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {p.community.name}
                <span className="ml-2 font-normal normal-case text-[var(--muted-foreground)]">
                  <Link href={`/communities/${p.community.slug}/post/${p.id}`} className={primaryLinkClass}>
                    View permalink
                  </Link>
                  {" · "}
                  <Link href={`/admin/communities/${p.community.id}`} className={primaryLinkClass}>
                    Community admin
                  </Link>
                </span>
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {p.kind} · {p.author.displayName ?? p.author.email} · {p.createdAt.toLocaleString()}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--foreground)]">{p.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={publishCommunityPostAction}>
                  <input type="hidden" name="postId" value={p.id} />
                  <input type="hidden" name="communityId" value={p.community.id} />
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
                  >
                    Publish
                  </button>
                </form>
                <form action={rejectCommunityPostAction} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="postId" value={p.id} />
                  <input type="hidden" name="communityId" value={p.community.id} />
                  <input
                    name="reason"
                    placeholder="Reason (optional)"
                    maxLength={2000}
                    className="min-w-[12rem] rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminPageContainer>
  );
}
