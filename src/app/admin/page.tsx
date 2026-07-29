import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { AdminAttentionList } from "@/components/admin/AdminAttentionList";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminStatTileLink } from "@/components/admin/AdminStatTileLink";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/viz/Sparkline";
import { getAdminDashboardTools } from "@/config/admin-nav";
import { requireAdminSession } from "@/lib/admin/require-session";
import { adminKickerClass, adminToolLinkCardClass } from "@/lib/admin/admin-ui-classes";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import {
  formatWeekDelta,
  getAdminHomeSnapshot,
} from "@/lib/server/admin-home-attention";

export default async function AdminHomePage() {
  await requireAdminSession();

  const snapshot = await getAdminHomeSnapshot();
  const dashboardTools = getAdminDashboardTools();
  const reportsDelta = formatWeekDelta(snapshot.reportsCreatedWeek);
  const contactsDelta = formatWeekDelta(snapshot.contactsWeek);
  const diasporaDelta = formatWeekDelta(snapshot.diasporaWeek);
  const sparkPoints = snapshot.reportsDailyLast14.map((d) => ({
    key: d.day,
    value: d.count,
    label: d.day,
  }));
  const sparkTotal = sparkPoints.reduce((s, p) => s + p.value, 0);

  return (
    <AdminPageContainer>
      <AdminPageHeader
        showDashboardBack={false}
        title="Dashboard"
        description="Start with what needs attention, then jump into queues and tools."
        actions={
          <form action={logoutAction}>
            <Button type="submit" variant="surface" density="admin" size="sm">
              Log out
            </Button>
          </form>
        }
      />

      <section className="mt-2">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Needs attention</h2>
          <p className="font-mono text-[11px] text-[var(--foreground-secondary)]">
            Snapshot {new Date(snapshot.generatedAt).toLocaleString("en-GB")}
          </p>
        </div>
        <AdminAttentionList items={snapshot.attention} className="mt-4" />
      </section>

      <AdminSectionCard className="mt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">Citizen report intake (14 days)</h2>
            <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
              Daily creates · {sparkTotal} total in window ·{" "}
              <Link href="/admin/analytics/citizen-reports" className={primaryLinkClass}>
                Full analytics
              </Link>
            </p>
          </div>
        </div>
        <Sparkline
          className="mt-4"
          points={sparkPoints}
          ariaLabel="Citizen reports created per day over the last 14 days"
          emptyFallback={
            <p className="mt-4 text-sm text-[var(--foreground-secondary)]">
              No daily intake series yet — submissions will appear here as reports arrive.
            </p>
          }
        />
      </AdminSectionCard>

      <h2 className="mt-12 font-display text-lg font-semibold text-[var(--foreground)]">At a glance</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AdminStatTileLink
          href="/admin/reports"
          label="Citizen reports"
          hint="All-time citizen reports. Footer shows open queue and SLA overdue counts."
          value={snapshot.reportsTotal}
          delta={reportsDelta.text}
          deltaTone={reportsDelta.tone}
          footer={
            <span className="text-[var(--primary)]">
              {snapshot.reportsQueue} in queue
              {snapshot.reportsSlaOverdue > 0 ? (
                <span className="text-rose-700"> · {snapshot.reportsSlaOverdue} SLA overdue</span>
              ) : null}{" "}
              <span className="text-[var(--foreground-secondary)]">→ triage</span>
            </span>
          }
        />
        <AdminStatTileLink
          href="/admin/petitions"
          label="Open petitions"
          hint="Petitions currently marked OPEN — close, archive, or reopen from the list."
          value={snapshot.petitionsOpen}
          footer={<span className="text-[var(--foreground-secondary)]">Close, archive, or reopen</span>}
        />
        <AdminStatTileLink
          href="/admin/contact-submissions"
          label="Contact (7 days)"
          hint="Contact form messages created in the last 7 days vs the prior week."
          value={snapshot.contactsWeek.current}
          delta={contactsDelta.text}
          deltaTone={contactsDelta.tone}
          footer={<span className="text-[var(--foreground-secondary)]">Form messages saved to Postgres</span>}
        />
        <AdminStatTileLink
          href="/admin/diaspora-feedback"
          label="Diaspora feedback (7 days)"
          hint="Diaspora visit experience submissions in the last 7 days vs the prior week."
          value={snapshot.diasporaWeek.current}
          delta={diasporaDelta.text}
          deltaTone={diasporaDelta.tone}
          footer={<span className="text-[var(--foreground-secondary)]">Visit experience form</span>}
        />
        <AdminStatTileLink
          href="/admin/leads"
          label="Lead captures"
          hint="All newsletter, early-access, and tracker waitlist signups."
          value={snapshot.leadsTotal}
          footer={<span className="text-[var(--foreground-secondary)]">Newsletter · early access · tracker</span>}
        />
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--section-light)]/50 p-5">
          <p className={adminKickerClass}>Public site</p>
          <p className="mt-2 text-sm leading-snug text-[var(--foreground-secondary)]">
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
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
                {tool.groupTitle}
              </p>
              <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                {tool.description ?? `Open ${tool.label}.`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
        <Link href="/" className={primaryLinkClass}>
          ← Public site
        </Link>
      </p>
    </AdminPageContainer>
  );
}
