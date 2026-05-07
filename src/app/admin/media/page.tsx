import Image from "next/image";
import Link from "next/link";

import { MediaUploadForm } from "@/app/admin/media/MediaUploadForm";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminMediaPage() {
  await requireAdminSession();
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Image library"
        description="Upload once, then pick these images as featured images on news posts."
      />
      <div className="max-w-lg">
        <MediaUploadForm />
      </div>
      <h2 className="mt-12 font-semibold text-[var(--foreground)]">All images</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <li className="text-sm text-[var(--muted-foreground)]">No uploads yet.</li>
        ) : (
          items.map((m) => (
            <li
              key={m.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-[var(--section-light)]">
                <Image src={m.storagePath} alt={m.alt || m.filename} fill className="object-cover" sizes="300px" />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-[var(--foreground)]">{m.filename}</p>
                <p className="mt-1 break-all font-mono text-[10px] text-[var(--muted-foreground)]">{m.id}</p>
              </div>
            </li>
          ))
        )}
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/admin/posts" className={primaryLinkClass}>
          ← News posts
        </Link>
      </p>
    </AdminPageContainer>
  );
}
