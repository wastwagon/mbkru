import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { MBKRU_VOICE_ANALYTICS_TAXONOMY } from "@/lib/mbkru-voice-analytics-taxonomy";
import {
  getMbkruVoiceAnalyticsSummary,
  parseMbkruVoiceAnalyticsDaysParam,
} from "@/lib/server/mbkru-voice-analytics";

const trackedEvents = MBKRU_VOICE_ANALYTICS_TAXONOMY;

type Props = { searchParams?: Promise<{ days?: string | string[] }> };

export default async function AdminMbkruVoiceAnalyticsPage({ searchParams }: Props) {
  await requireAdminSession();
  const sp = (await searchParams) ?? {};
  const daysRaw = Array.isArray(sp.days) ? sp.days[0] : sp.days;
  const days = parseMbkruVoiceAnalyticsDaysParam(daysRaw ?? null);

  const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
  const plausibleEnabled = Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim());
  const telemetryTokenEnabled = Boolean(process.env.MBKRU_VOICE_EVENT_TOKEN?.trim());
  const dbEnabled = isDatabaseConfigured();
  const summary = dbEnabled ? await getMbkruVoiceAnalyticsSummary(days) : null;

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="MBKRU Voice analytics"
        description="Event taxonomy for the MBKRU Voice chatbot and accessibility tools. Track volumes, errors, and AI versus fallback behaviour in GA4 or Plausible."
      />
      <p className="mt-2 text-sm">
        <Link href={`/api/admin/analytics/mbkru-voice?days=${days}`} className={primaryLinkClass}>
          JSON API
        </Link>{" "}
        <span className="text-[var(--muted-foreground)]">(session required)</span>
        {" · "}
        <Link href={`/api/admin/analytics/mbkru-voice/export?days=${days}`} className={primaryLinkClass}>
          Download CSV snapshot
        </Link>{" "}
        <span className="text-[var(--muted-foreground)]">(session required, UTF-8)</span>
      </p>
      <p className="mt-2 text-sm">
        <span className="text-[var(--muted-foreground)]">Window:</span>{" "}
        {[7, 30, 90].map((option, index) => (
          <span key={option}>
            {index > 0 ? " · " : null}
            <Link
              href={`/admin/analytics/mbkru-voice?days=${option}`}
              className={option === days ? `font-semibold text-[var(--foreground)] underline ${primaryLinkClass}` : primaryLinkClass}
            >
              {option} days
            </Link>
          </span>
        ))}
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <AdminMetricCard
          surface="tile"
          label="GA4 status"
          value={gaEnabled ? "Configured" : "Not configured"}
          subline={
            gaEnabled
              ? "Use Events reports and filters on source/language properties."
              : "Set NEXT_PUBLIC_GA_MEASUREMENT_ID to capture events in Google Analytics."
          }
        />
        <AdminMetricCard
          surface="tile"
          label="Plausible status"
          value={plausibleEnabled ? "Configured" : "Not configured"}
          subline={
            plausibleEnabled
              ? "Use custom events dashboard for MBKRU Voice flows."
              : "Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to capture events in Plausible."
          }
        />
        <AdminSectionCard className="rounded-2xl shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Internal DB analytics</p>
          <p className="mt-2 text-sm text-[var(--foreground)]">{dbEnabled ? "Configured" : "Not configured"}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {dbEnabled
              ? "Ingestion API stores MBKRU Voice events in Postgres for in-platform reporting."
              : "Set DATABASE_URL to enable internal MBKRU Voice analytics storage."}
          </p>
          <p className="mt-2 text-xs">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 font-semibold ${
                telemetryTokenEnabled
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-amber-300 bg-amber-50 text-amber-700"
              }`}
            >
              {telemetryTokenEnabled ? "Token mode enabled" : "Token mode disabled"}
            </span>
          </p>
        </AdminSectionCard>
      </section>

      {summary ? (
        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label={`Events (${summary.windowDays} days)`}
            value={summary.windowRows.reduce((acc, row) => acc + row.count, 0)}
          />
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label="Unique event names"
            value={summary.windowRows.length}
          />
          <AdminMetricCard
            surface="tile"
            label={`Top source (${summary.windowDays} days)`}
            value={summary.bySourceWindow[0]?.source ?? "No data"}
          />
        </section>
      ) : null}

      <AdminTablePanel className="mt-8 shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Event name</th>
              <th className="px-4 py-3 font-medium">Meaning</th>
              <th className="px-4 py-3 font-medium">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {trackedEvents.map((event) => (
              <tr key={event.name} className="border-b border-[var(--border)] last:border-0">
                <td className="px-4 py-3 align-top">
                  <code className="text-xs text-[var(--foreground)]">{event.name}</code>
                </td>
                <td className="px-4 py-3 align-top text-[var(--foreground)]">{event.meaning}</td>
                <td className="px-4 py-3 align-top text-[var(--muted-foreground)]">{event.signal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTablePanel>

      {summary ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <AdminSectionCard className="rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Internal DB events (last {summary.windowDays} days)
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.windowRows.length === 0 ? (
                <li>
                  <AdminEmptyState message="No rows yet." />
                </li>
              ) : (
                summary.windowRows.map((row) => (
                  <li key={`w-${row.eventName}`} className="flex justify-between gap-2">
                    <code className="text-xs text-[var(--muted-foreground)]">{row.eventName}</code>
                    <span className="tabular-nums font-medium text-[var(--foreground)]">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </AdminSectionCard>
          <AdminSectionCard className="rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Event source split (last {summary.windowDays} days)
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.bySourceWindow.length === 0 ? (
                <li>
                  <AdminEmptyState message="No rows yet." />
                </li>
              ) : (
                summary.bySourceWindow.map((row) => (
                  <li key={`s-${row.source}`} className="flex justify-between gap-2">
                    <code className="text-xs text-[var(--muted-foreground)]">{row.source}</code>
                    <span className="tabular-nums font-medium text-[var(--foreground)]">{row.count}</span>
                  </li>
                ))
              )}
            </ul>
          </AdminSectionCard>
        </div>
      ) : null}

      <p className="mt-4 text-xs text-[var(--muted-foreground)]">
        Tip: <code className="text-xs">mbkru_voice_reply_received</code> payloads include <code>source</code>,{" "}
        <code>safety_reason</code> (when applicable), <code>site_context</code> (comma‑separated in‑app paths from curated
        site knowledge), and <code>web_search_used</code> (when live search augmented the turn).
      </p>
    </AdminPageContainer>
  );
}
