import Link from "next/link";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminTd } from "@/components/admin/AdminTd";
import { AdminWindowFilterChips } from "@/components/admin/AdminWindowFilterChips";
import { StatBarList } from "@/components/viz/StatBarList";
import { requireAdminSession } from "@/lib/admin/require-session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { MBKRU_VOICE_ANALYTICS_TAXONOMY } from "@/lib/mbkru-voice-analytics-taxonomy";
import { primaryLinkClass } from "@/lib/primary-link-styles";
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
        <span className="text-[var(--foreground-secondary)]">(session required)</span>
        {" · "}
        <Link href={`/api/admin/analytics/mbkru-voice/export?days=${days}`} className={primaryLinkClass}>
          Download CSV snapshot
        </Link>{" "}
        <span className="text-[var(--foreground-secondary)]">(session required, UTF-8)</span>
        {" · "}
        <Link href="/admin/analytics/mbkru-voice/events" className={primaryLinkClass}>
          Raw events (recent rows)
        </Link>
      </p>
      <AdminWindowFilterChips
        className="mt-4"
        hrefBase="/admin/analytics/mbkru-voice"
        param="days"
        active={days}
        options={[
          { value: 7, label: "7 days" },
          { value: 30, label: "30 days" },
          { value: 90, label: "90 days" },
        ]}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <AdminMetricCard
          surface="tile"
          label="GA4 status"
          hint="Browser events fire when NEXT_PUBLIC_GA_MEASUREMENT_ID is set."
          value={gaEnabled ? "Configured" : "Not configured"}
          delta={gaEnabled ? "Live" : "Setup"}
          deltaTone={gaEnabled ? "success" : "warning"}
          subline={
            gaEnabled
              ? "Use Events reports and filters on source/language properties."
              : "Set NEXT_PUBLIC_GA_MEASUREMENT_ID to capture events in Google Analytics."
          }
        />
        <AdminMetricCard
          surface="tile"
          label="Plausible status"
          hint="Privacy-friendly custom events when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set."
          value={plausibleEnabled ? "Configured" : "Not configured"}
          delta={plausibleEnabled ? "Live" : "Setup"}
          deltaTone={plausibleEnabled ? "success" : "warning"}
          subline={
            plausibleEnabled
              ? "Use custom events dashboard for MBKRU Voice flows."
              : "Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to capture events in Plausible."
          }
        />
        <AdminSectionCard className="rounded-2xl shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground-secondary)]">
            Internal DB analytics
          </p>
          <p className="mt-2 text-sm text-[var(--foreground)]">{dbEnabled ? "Configured" : "Not configured"}</p>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
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
            hint="Sum of stored event rows in the selected window."
            value={summary.windowRows.reduce((acc, row) => acc + row.count, 0)}
          />
          <AdminMetricCard
            surface="tile"
            valueSize="xl"
            label="Unique event names"
            hint="Distinct eventName values seen in the window."
            value={summary.windowRows.length}
          />
          <AdminMetricCard
            surface="tile"
            label={`Top source (${summary.windowDays} days)`}
            hint="Highest-volume source tag in the window (chatbot, a11y, etc.)."
            value={summary.bySourceWindow[0]?.source ?? "No data"}
          />
        </section>
      ) : null}

      <AdminTablePanel className="mt-8 shadow-sm">
        <table className="admin-table-stack min-w-full text-left text-sm">
          <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--foreground-secondary)]">
            <tr>
              <th className="px-4 py-3 font-medium">Event name</th>
              <th className="px-4 py-3 font-medium">Meaning</th>
              <th className="px-4 py-3 font-medium">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {trackedEvents.map((event) => (
              <tr key={event.name} className="border-b border-[var(--border)] last:border-0">
                <AdminTd label="Event name" className="px-4 py-3 align-top sm:px-4 sm:py-3">
                  <code className="text-xs text-[var(--foreground)]">{event.name}</code>
                </AdminTd>
                <AdminTd label="Meaning" className="px-4 py-3 align-top text-[var(--foreground)] sm:px-4 sm:py-3">
                  {event.meaning}
                </AdminTd>
                <AdminTd
                  label="Why it matters"
                  className="px-4 py-3 align-top text-[var(--foreground-secondary)] sm:px-4 sm:py-3"
                >
                  {event.signal}
                </AdminTd>
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
            {summary.windowRows.length === 0 ? (
              <AdminEmptyState
                className="mt-4"
                title="No events in this window"
                message="Widen the window or confirm the chatbot is posting telemetry."
                action={{ href: "/admin/analytics/mbkru-voice/events", label: "Inspect raw events" }}
              />
            ) : (
              <StatBarList
                items={summary.windowRows.map((row) => ({
                  key: row.eventName,
                  label: row.eventName,
                  count: row.count,
                }))}
              />
            )}
          </AdminSectionCard>
          <AdminSectionCard className="rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Event source split (last {summary.windowDays} days)
            </h2>
            {summary.bySourceWindow.length === 0 ? (
              <AdminEmptyState
                className="mt-4"
                title="No source split yet"
                message="Events will appear here once ingestion stores rows with a source tag."
              />
            ) : (
              <StatBarList
                items={summary.bySourceWindow.map((row) => ({
                  key: row.source,
                  label: row.source,
                  count: row.count,
                }))}
                accent="gold"
              />
            )}
          </AdminSectionCard>
        </div>
      ) : (
        <AdminEmptyState
          className="mt-8"
          title="Internal analytics unavailable"
          message="Configure DATABASE_URL to store and chart MBKRU Voice events in-platform."
        />
      )}

      <p className="mt-4 text-xs text-[var(--foreground-secondary)]">
        Tip: <code className="text-xs">mbkru_voice_reply_received</code> payloads include <code>source</code>,{" "}
        <code>safety_reason</code> (when applicable), <code>site_context</code> (comma‑separated in‑app paths from curated
        site knowledge), and <code>web_search_used</code> (when live search augmented the turn).
      </p>
    </AdminPageContainer>
  );
}
