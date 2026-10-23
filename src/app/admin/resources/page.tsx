import Image from "next/image";
import Link from "next/link";

import {
  createResourceDocumentAction,
  publishResourceDocumentAction,
  unpublishResourceDocumentAction,
  updateResourceCoverAction,
} from "@/app/admin/resources/actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminMediaField } from "@/components/admin/AdminMediaField";
import { DeleteResourceDocumentForm } from "@/components/admin/DeleteResourceDocumentForm";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { requireAdminSession } from "@/lib/admin/require-session";
import {
  adminQueueActionClass,
  adminQueueActionLinkClass,
  adminQueueActionSuccessPublishClass,
} from "@/lib/admin/admin-ui-classes";
import { resourceCategoryLabel } from "@/lib/content/resource-documents";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminResourcesPage() {
  await requireAdminSession();

  const docs = await prisma.resourceDocument.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      coverMedia: { select: { id: true, storagePath: true, filename: true, alt: true } },
    },
  });

  return (
    <AdminPageContainer width="form">
      <AdminPageHeader
        title="Resource library"
        description={
          <>
            Upload PDFs and documents for the public{" "}
            <Link href="/resources" className={primaryLinkClass}>
              Resources
            </Link>{" "}
            page. Drafts stay hidden until you publish.
          </>
        }
      />

      <section className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add document</h2>
        <form action={createResourceDocumentAction} encType="multipart/form-data" className="mt-4 space-y-3">
          <FormField label="Title" htmlFor="title">
            <Input id="title" name="title" required minLength={2} maxLength={240} density="admin" />
          </FormField>
          <FormField label="Slug" htmlFor="slug" optional>
            <Input
              id="slug"
              name="slug"
              maxLength={120}
              placeholder="auto from title if empty"
              density="admin"
            />
          </FormField>
          <FormField label="Summary" htmlFor="summary" optional>
            <Textarea id="summary" name="summary" rows={2} maxLength={600} density="admin" />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Category" htmlFor="category">
              <Select id="category" name="category" density="admin">
                <option value="REPORTS">Reports</option>
                <option value="POLICY_BRIEFS">Policy briefs</option>
                <option value="RESEARCH">Research</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
            <FormField label="Sort order" htmlFor="sortOrder">
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                max={999999}
                defaultValue={0}
                density="admin"
              />
            </FormField>
          </div>
          <FormField label="File (PDF, Word, ODT, plain text — max 25 MB)" htmlFor="file">
            <Input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,text/plain"
              density="admin"
              className="border-0 bg-transparent px-0 shadow-none text-[var(--foreground-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </FormField>
          <AdminMediaField
            name="coverMediaId"
            label="Cover image (optional)"
            help="Shown on the public Resources list and document page."
          />
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input type="checkbox" name="publishNow" className="rounded border-[var(--border)]" />
            Publish immediately
          </label>
          <Button type="submit" density="admin">
            Save document
          </Button>
        </form>
      </section>

      <h2 className="mt-12 text-sm font-semibold text-[var(--foreground)]">All documents ({docs.length})</h2>
      <ul className="mt-4 space-y-3">
        {docs.length === 0 ? (
          <li>
            <AdminEmptyState message="No documents yet." />
          </li>
        ) : (
          docs.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                {d.coverMedia ? (
                  <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--section-light)]">
                    <Image
                      src={d.coverMedia.storagePath}
                      alt={d.coverMedia.alt || d.coverMedia.filename}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </span>
                ) : null}
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">{d.title}</p>
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
                    {resourceCategoryLabel(d.category)} · slug:{" "}
                    <span className="font-mono">{d.slug}</span>
                    {d.publishedAt ? (
                      <span className="text-emerald-700"> · published</span>
                    ) : (
                      <span> · draft</span>
                    )}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--foreground-secondary)]">{d.originalFilename}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-[var(--primary)]">
                      {d.coverMedia ? "Edit cover image" : "Add cover image"}
                    </summary>
                    <form action={updateResourceCoverAction} className="mt-2 space-y-3">
                      <input type="hidden" name="id" value={d.id} />
                      <AdminMediaField
                        name="coverMediaId"
                        label="Cover image"
                        initial={d.coverMedia}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)]"
                      >
                        Save cover
                      </button>
                    </form>
                  </details>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.publishedAt ? (
                  <Link
                    href={`/resources/${d.slug}`}
                    className={adminQueueActionLinkClass}
                  >
                    Public page
                  </Link>
                ) : null}
                <a
                  href={d.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={adminQueueActionLinkClass}
                >
                  Download
                </a>
                {!d.publishedAt ? (
                  <form action={publishResourceDocumentAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className={adminQueueActionSuccessPublishClass}
                    >
                      Publish
                    </button>
                  </form>
                ) : (
                  <form action={unpublishResourceDocumentAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className={adminQueueActionClass}
                    >
                      Unpublish
                    </button>
                  </form>
                )}
                <DeleteResourceDocumentForm id={d.id} />
              </div>
            </li>
          ))
        )}
      </ul>
    </AdminPageContainer>
  );
}
