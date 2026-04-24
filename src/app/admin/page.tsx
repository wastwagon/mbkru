import Link from "next/link";

import { accountabilityProse } from "@/config/accountability-catalogue-destinations";

import { logoutAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";

export default async function AdminHomePage() {
  await requireAdminSession();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [reportsTotal, reportsQueue, contactsWeek, diasporaFeedbackWeek, leadsTotal, petitionsOpen] =
    await Promise.all([
      prisma.citizenReport.count(),
      prisma.citizenReport.count({
        where: { status: { in: ["RECEIVED", "UNDER_REVIEW"] } },
      }),
      prisma.contactSubmission.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.diasporaFeedbackSubmission.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.leadCapture.count(),
      prisma.petition.count({ where: { status: "OPEN" } }),
    ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            CMS, citizen voice, accountability data, and inbound leads — quick snapshot below.
          </p>
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link
          href="/admin/reports"
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Citizen reports</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{reportsTotal}</p>
          <p className="mt-2 text-sm text-[var(--primary)]">
            {reportsQueue} in queue <span className="text-[var(--muted-foreground)]">→ triage</span>
          </p>
        </Link>
        <Link
          href="/admin/petitions"
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Open petitions</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{petitionsOpen}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Close, archive, or reopen</p>
        </Link>
        <Link
          href="/admin/contact-submissions"
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Contact (7 days)</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{contactsWeek}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Form messages saved to Postgres</p>
        </Link>
        <Link
          href="/admin/diaspora-feedback"
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
            Diaspora feedback (7 days)
          </p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {diasporaFeedbackWeek}
          </p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Visit experience form</p>
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition hover:border-[var(--primary)]/35"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Lead captures</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums text-[var(--foreground)]">{leadsTotal}</p>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Newsletter · early access · tracker</p>
        </Link>
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Public site</p>
          <p className="mt-2 text-sm leading-snug text-[var(--muted-foreground)]">
            Preview live pages from the{" "}
            <Link href="/" className={primaryLinkClass}>
              homepage
            </Link>
            .
          </p>
        </div>
      </div>

      <h2 className="mt-12 font-display text-lg font-semibold text-[var(--foreground)]">Admin tools</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
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
            href="/admin/resources"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Resource library</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              PDFs and documents for the public Resources page.
            </p>
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
            href="/admin/analytics/citizen-reports"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Citizen report analytics</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Aggregate counts by kind, status, region, and month (no personal data).
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/petitions"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Petitions</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Moderate member petitions — close signatures, archive from the site, or reopen.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/analytics/petition-pending"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Petition pending analytics</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Guest verification queue: active vs expired pending, creation windows, by petition.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/public-causes"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Public causes</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Queue of Voice reports with public threads — draft, live, and closed.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/parliament"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">
              {accountabilityProse.adminParliamentSectionTitle}
            </span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {accountabilityProse.adminDashboardParliamentCard}
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/manifestos"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Manifesto registry</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Register party manifestos for promise sourcing and public API.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/communities"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Communities</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Create communities, approve joins, and moderate posts.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/communities/moderation"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Community post moderation</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              All pending community posts in one queue (publish or reject).
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/community-reports"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Community reports queue</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Review community post reports across all groups from one queue.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/community-verifications"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Community verifications</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Approve or reject Queen Mother / traditional authority verification requests.
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/members"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Members</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Identity verification status for MBKRU Voice accounts (staff notes stay internal).
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/town-halls"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Town halls &amp; forums</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Programme rows for forums and constituency debates — dates, venues, citations.
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
            href="/admin/diaspora-feedback"
            className="block rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition hover:border-[var(--primary)]/30"
          >
            <span className="font-semibold text-[var(--foreground)]">Diaspora feedback</span>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Experience &amp; feedback form submissions from diaspora visitors (records in Postgres).
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
        <Link href="/" className={primaryLinkClass}>
          ← Back to website
        </Link>
      </p>
    </div>
  );
}
