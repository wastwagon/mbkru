import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { focusRingMdClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

export default async function AdminPostsPage() {
  await requireAdminSession();
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="News posts"
        description="Create and publish articles for the public news index."
        actions={
          <Link
            href="/admin/posts/new"
            className={`inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingMdClass}`}
          >
            New post
          </Link>
        }
      />
      <AdminListPanel>
        {posts.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No posts yet.</li>
        ) : (
          posts.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{p.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  /{p.slug} · {p.publishedAt ? "Published" : "Draft"}
                </p>
              </div>
              <Link href={`/admin/posts/${p.id}`} className={`${primaryNavLinkClass} text-sm font-semibold`}>
                Edit
              </Link>
            </li>
          ))
        )}
      </AdminListPanel>
    </AdminPageContainer>
  );
}
