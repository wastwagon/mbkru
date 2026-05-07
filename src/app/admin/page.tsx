import Link from "next/link";

import { getAdminDashboardTools } from "@/config/admin-nav";

import { logoutAction } from "@/app/admin/actions";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatTileLink } from "@/components/admin/AdminStatTileLink";
import { adminKickerClass, adminToolLinkCardClass } from "@/lib/admin/admin-ui-classes";
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
  const dashboardTools = getAdminDashboardTools();

  return (
    <AdminPageContainer>
      <AdminPageHeader
        showDashboardBack={false}
        title="Dashboard"
        description="Content, citizen voice, accountability tools, and inbound leads at a glance."
        actions={
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              Log out
            </button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStatTileLink
          href="/admin/reports"
          label="Citizen reports"
          value={reportsTotal}
          footer={
            <span className="text-[var(--primary)]">
              {reportsQueue} in queue <span className="text-[var(--muted-foreground)]">→ triage</span>
            </span>
          }
        />
        <AdminStatTileLink
          href="/admin/petitions"
          label="Open petitions"
          value={petitionsOpen}
          footer={<span className="text-[var(--muted-foreground)]">Close, archive, or reopen</span>}
        />
        <AdminStatTileLink
          href="/admin/contact-submissions"
          label="Contact (7 days)"
          value={contactsWeek}
          footer={<span className="text-[var(--muted-foreground)]">Form messages saved to Postgres</span>}
        />
        <AdminStatTileLink
          href="/admin/diaspora-feedback"
          label="Diaspora feedback (7 days)"
          value={diasporaFeedbackWeek}
          footer={<span className="text-[var(--muted-foreground)]">Visit experience form</span>}
        />
        <AdminStatTileLink
          href="/admin/leads"
          label="Lead captures"
          value={leadsTotal}
          footer={<span className="text-[var(--muted-foreground)]">Newsletter · early access · tracker</span>}
        />
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 p-5">
          <p className={adminKickerClass}>Public site</p>
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
        {dashboardTools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className={adminToolLinkCardClass}>
              <span className="font-semibold text-[var(--foreground)]">{tool.label}</span>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                {tool.groupTitle}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {tool.description ?? `Open ${tool.label}.`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
        <Link href="/" className={primaryLinkClass}>
          ← Public site
        </Link>
      </p>
    </AdminPageContainer>
  );
}
