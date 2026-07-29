import Link from "next/link";

import { deletePostAction, savePostAction } from "@/app/admin/posts/actions";
import { AdminConfirmDeleteForm } from "@/components/admin/AdminConfirmDeleteForm";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import type { Media, Post } from "@prisma/client";

type PostWithOptional = (Post & { featuredMedia: Media | null }) | null;

export function PostEditor({ post, media }: { post: PostWithOptional; media: Media[] }) {
  const isEdit = Boolean(post);

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader title={isEdit ? "Edit post" : "New post"} />
      <form action={savePostAction} className="mt-2 space-y-5">
        {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
        <FormField label="Title" htmlFor="title">
          <Input id="title" name="title" required defaultValue={post?.title ?? ""} density="admin" />
        </FormField>
        <FormField label="Slug (URL)" htmlFor="slug">
          <Input
            id="slug"
            name="slug"
            placeholder="auto from title if empty"
            defaultValue={post?.slug ?? ""}
            density="admin"
          />
        </FormField>
        <FormField label="Excerpt" htmlFor="excerpt">
          <Textarea id="excerpt" name="excerpt" rows={3} defaultValue={post?.excerpt ?? ""} density="admin" />
        </FormField>
        <FormField label="Body (Markdown)" htmlFor="body">
          <Textarea
            id="body"
            name="body"
            required
            rows={16}
            defaultValue={post?.body ?? ""}
            density="admin"
            className="font-mono text-sm"
          />
        </FormField>
        <FormField
          label="Featured image (library)"
          htmlFor="featuredMediaId"
          hint={
            <>
              <Link href="/admin/media" className={primaryLinkClass}>
                Upload images
              </Link>{" "}
              to reuse them here.
            </>
          }
        >
          <Select
            id="featuredMediaId"
            name="featuredMediaId"
            defaultValue={post?.featuredMediaId ?? ""}
            density="admin"
          >
            <option value="">None</option>
            {media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename} {m.alt ? `— ${m.alt}` : ""}
              </option>
            ))}
          </Select>
        </FormField>
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
          <Button type="submit" density="admin">
            Save
          </Button>
          <Button href="/admin/posts" variant="surface" density="admin">
            Cancel
          </Button>
        </div>
      </form>

      {isEdit && post ? (
        <div className="mt-10 border-t border-[var(--border)] pt-8">
          <AdminConfirmDeleteForm
            action={deletePostAction}
            hiddenFields={{ id: post.id }}
            title="Delete this post?"
            description="This permanently deletes the post. This cannot be undone."
            buttonLabel="Delete post"
            variant="text"
          />
        </div>
      ) : null}
    </AdminPageContainer>
  );
}
