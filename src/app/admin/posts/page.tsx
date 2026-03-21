import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPostsPage() {
  await requireAdminSession();
  const posts = await prisma.post.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">News posts</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          New post
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
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
              <Link
                href={`/admin/posts/${p.id}`}
                className="text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Edit
              </Link>
            </li>
          ))
        )}
      </ul>
      <p className="mt-8">
        <Link href="/admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
