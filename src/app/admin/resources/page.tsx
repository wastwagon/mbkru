import Link from "next/link";

import {
  createResourceDocumentAction,
  publishResourceDocumentAction,
  unpublishResourceDocumentAction,
} from "@/app/admin/resources/actions";
import { DeleteResourceDocumentForm } from "@/components/admin/DeleteResourceDocumentForm";
import { requireAdminSession } from "@/lib/admin/require-session";
import { resourceCategoryLabel } from "@/lib/content/resource-documents";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminResourcesPage() {
  await requireAdminSession();

  const docs = await prisma.resourceDocument.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Resource library</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">
        Upload PDFs and documents for the public{" "}
        <Link href="/resources" className={primaryLinkClass}>
          Resources
        </Link>{" "}
        page. Drafts stay hidden until you publish.
      </p>

      <section className="mt-10 rounded-xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Add document</h2>
        <form action={createResourceDocumentAction} encType="multipart/form-data" className="mt-4 space-y-3">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-[var(--foreground)]">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              minLength={2}
              maxLength={240}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-xs font-medium text-[var(--foreground)]">
              Slug (optional)
            </label>
            <input
              id="slug"
              name="slug"
              maxLength={120}
              placeholder="auto from title if empty"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="summary" className="block text-xs font-medium text-[var(--foreground)]">
              Summary (optional)
            </label>
            <textarea
              id="summary"
              name="summary"
              rows={2}
              maxLength={600}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-[var(--foreground)]">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              >
                <option value="REPORTS">Reports</option>
                <option value="POLICY_BRIEFS">Policy briefs</option>
                <option value="RESEARCH">Research</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortOrder" className="block text-xs font-medium text-[var(--foreground)]">
                Sort order
              </label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                max={999999}
                defaultValue={0}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="file" className="block text-xs font-medium text-[var(--foreground)]">
              File (PDF, Word, ODT, plain text — max 25 MB)
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.odt,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.oasis.opendocument.text,text/plain"
              className="mt-1 block w-full text-sm text-[var(--muted-foreground)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--primary)] file:px-4 file:py-2 file:font-semibold file:text-white"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input type="checkbox" name="publishNow" className="rounded border-[var(--border)]" />
            Publish immediately
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
          >
            Save document
          </button>
        </form>
      </section>

      <h2 className="mt-12 text-sm font-semibold text-[var(--foreground)]">All documents ({docs.length})</h2>
      <ul className="mt-4 space-y-3">
        {docs.length === 0 ? (
          <li className="text-sm text-[var(--muted-foreground)]">No documents yet.</li>
        ) : (
          docs.map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--foreground)]">{d.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {resourceCategoryLabel(d.category)} · slug:{" "}
                  <span className="font-mono">{d.slug}</span>
                  {d.publishedAt ? (
                    <span className="text-emerald-700"> · published</span>
                  ) : (
                    <span> · draft</span>
                  )}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{d.originalFilename}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {d.publishedAt ? (
                  <Link
                    href={`/resources/${d.slug}`}
                    className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
                  >
                    Public page
                  </Link>
                ) : null}
                <a
                  href={d.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] hover:bg-[var(--muted)]"
                >
                  Download
                </a>
                {!d.publishedAt ? (
                  <form action={publishResourceDocumentAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-emerald-600/40 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-100"
                    >
                      Publish
                    </button>
                  </form>
                ) : (
                  <form action={unpublishResourceDocumentAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
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
    </div>
  );
}
