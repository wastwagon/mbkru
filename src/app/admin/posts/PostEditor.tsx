import Link from "next/link";

import { deletePostAction, savePostAction } from "@/app/admin/posts/actions";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { destructiveTextControlClass, primaryLinkClass } from "@/lib/primary-link-styles";
import type { Media, Post } from "@prisma/client";

type PostWithOptional = (Post & { featuredMedia: Media | null }) | null;

export function PostEditor({ post, media }: { post: PostWithOptional; media: Media[] }) {
  const isEdit = Boolean(post);

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader title={isEdit ? "Edit post" : "New post"} />
      <form action={savePostAction} className="mt-2 space-y-5">
        {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Title</label>
          <input
            name="title"
            required
            defaultValue={post?.title ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Slug (URL)</label>
          <input
            name="slug"
            placeholder="auto from title if empty"
            defaultValue={post?.slug ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Excerpt</label>
          <textarea
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Body (Markdown)</label>
          <textarea
            name="body"
            required
            rows={16}
            defaultValue={post?.body ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-3 font-mono text-sm text-[var(--foreground)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]">Featured image (library)</label>
          <select
            name="featuredMediaId"
            defaultValue={post?.featuredMediaId ?? ""}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-4 py-3 text-[var(--foreground)]"
          >
            <option value="">None</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename} {m.alt ? `— ${m.alt}` : ""}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            <Link href="/admin/media" className={primaryLinkClass}>
              Upload images
            </Link>{" "}
            to reuse them here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="published"
            id="published"
            defaultChecked={Boolean(post?.publishedAt)}
            className="h-4 w-4 rounded border-[var(--border)]"
          />
          <label htmlFor="published" className="text-sm text-[var(--foreground)]">
            Published (visible on /news)
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-xl bg-[var(--primary)] px-6 py-3 font-semibold text-white">
            Save
          </button>
          <Link
            href="/admin/posts"
            className="inline-flex items-center rounded-xl border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--foreground)]"
          >
            Cancel
          </Link>
        </div>
      </form>

      {isEdit && post ? (
        <form action={deletePostAction} className="mt-10 border-t border-[var(--border)] pt-8">
          <input type="hidden" name="id" value={post.id} />
          <button
            type="submit"
            className={`text-sm font-semibold text-red-600 ${destructiveTextControlClass}`}
          >
            Delete post
          </button>
        </form>
      ) : null}
    </AdminPageContainer>
  );
}
