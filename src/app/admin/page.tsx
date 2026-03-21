import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/require-session";

export default async function AdminHomePage() {
  await requireAdminSession();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage news posts and the shared image library.</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
          >
            Log out
          </button>
        </form>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/posts"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">News posts</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Create, edit, publish articles.</p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/media"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Image library</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Upload once, reuse on any post.</p>
          </Link>
        </li>
      </ul>
      <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/" className="text-[var(--primary)] hover:underline">
          ← Back to website
        </Link>
      </p>
    </div>
  );
}
