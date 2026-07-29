import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

export default async function AdminPostsPage() {
  await requireAdminSession();
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="News posts"
        description="Create and publish articles for the public news index."
        actions={
          <Button href="/admin/posts/new" density="admin">
            New post
          </Button>
        }
      />
      <AdminListPanel>
        {posts.length === 0 ? (
          <li className="p-6">
            <AdminEmptyState
              title="No posts yet"
              message="Create an article to appear on the public news index."
              action={{ href: "/admin/posts/new", label: "New post" }}
            />
          </li>
        ) : (
          posts.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--foreground)]">{p.title}</p>
                <p className="text-xs text-[var(--foreground-secondary)]">
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
