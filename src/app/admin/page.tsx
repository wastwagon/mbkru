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
        <li>
          <Link
            href="/admin/reports"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Citizen reports</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              MBKRU Voice queue — triage and update status.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/parliament"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Parliament &amp; promises</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              CSV import for MPs/ministers and campaign promise records.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/report-card"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Report card</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Publish People&apos;s Report Card cycles and scorecard entries.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/leads"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Lead capture</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Newsletter, early access, and Parliament tracker waitlists.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/contact-submissions"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Contact form</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Inbound messages from the public contact form (Postgres audit trail).
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/settings"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Settings</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Run migrations or seed if deploy-time database steps failed.
            </p>
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
