import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminTablePanel } from "@/components/admin/AdminTablePanel";
import { AdminTd } from "@/components/admin/AdminTd";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { listMbkruVoiceAnalyticsEventRows } from "@/lib/server/mbkru-voice-analytics";

type Props = {
  searchParams?: Promise<{
    page?: string | string[];
    q?: string | string[];
  }>;
};

export default async function AdminMbkruVoiceAnalyticsEventsPage({ searchParams }: Props) {
  await requireAdminSession();
  const sp = (await searchParams) ?? {};
  const dbEnabled = isDatabaseConfigured();

  const pageRaw = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const pageParsed = Number.parseInt(String(pageRaw ?? "1"), 10);
  const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

  const qRaw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (qRaw ?? "").trim();

  const result =
    dbEnabled ? await listMbkruVoiceAnalyticsEventRows({ page, pageSize: 50, eventNameContains: q || undefined }) : null;

  function pageHref(next: number) {
    const p = new URLSearchParams();
    if (next > 1) p.set("page", String(next));
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/admin/analytics/mbkru-voice/events?${qs}` : "/admin/analytics/mbkru-voice/events";
  }

  return (
    <AdminPageContainer width="wide">
      <AdminPageHeader
        title="MBKRU Voice raw events"
        description="Recent rows stored in Postgres. Use sparingly — payloads may contain user-supplied snippets when applicable."
      />
      <p className="mt-2 text-sm">
        <Link href="/admin/analytics/mbkru-voice" className={primaryLinkClass}>
          ← Summary analytics
        </Link>
      </p>

      {!dbEnabled ? (
        <AdminEmptyState
          className="mt-8"
          title="Database not configured"
          message="Set DATABASE_URL to inspect stored MBKRU Voice event rows."
        />
      ) : (
        <>
          <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <FormField label="Filter name contains" htmlFor="q">
              <Input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                maxLength={120}
                density="compact"
                className="w-full min-w-0 sm:w-48"
              />
            </FormField>
            <Button type="submit" density="admin">
              Apply
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-secondary)]">
            <span>
              Page {result?.page ?? 1} of {result?.pageCount ?? 1} · {result?.total ?? 0} total
            </span>
            {(result?.page ?? 1) > 1 ? (
              <Link href={pageHref((result?.page ?? 1) - 1)} className={primaryLinkClass}>
                Previous
              </Link>
            ) : null}
            {result && result.page < result.pageCount ? (
              <Link href={pageHref(result.page + 1)} className={primaryLinkClass}>
                Next
              </Link>
            ) : null}
          </div>

          {!result?.rows?.length ? (
            <AdminEmptyState
              className="mt-8"
              title="No events in view"
              message={
                q
                  ? `Nothing matched “${q}”. Clear the filter or try a shorter event-name fragment.`
                  : "The outbox has not stored any MBKRU Voice rows yet."
              }
              action={
                q
                  ? { href: "/admin/analytics/mbkru-voice/events", label: "Clear filter" }
                  : { href: "/admin/analytics/mbkru-voice", label: "Back to summary" }
              }
            />
          ) : (
            <AdminTablePanel className="mt-6 shadow-sm">
              <table className="admin-table-stack min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--foreground-secondary)]">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 font-medium sm:px-3 sm:py-2">Time (UTC)</th>
                    <th className="px-3 py-2 font-medium sm:px-3 sm:py-2">Event</th>
                    <th className="px-3 py-2 font-medium sm:px-3 sm:py-2">Source</th>
                    <th className="px-3 py-2 font-medium sm:px-3 sm:py-2">Lang</th>
                    <th className="min-w-[12rem] px-3 py-2 font-medium sm:px-3 sm:py-2">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={String(row.id)} className="border-b border-[var(--border)] align-top text-xs">
                      <AdminTd label="Time (UTC)" className="whitespace-nowrap px-3 py-2 font-mono text-[var(--foreground-secondary)] sm:px-3 sm:py-2">
                        {row.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                      </AdminTd>
                      <AdminTd label="Event" className="px-3 py-2 sm:px-3 sm:py-2">
                        <code>{row.eventName}</code>
                      </AdminTd>
                      <AdminTd label="Source" className="px-3 py-2 sm:px-3 sm:py-2">
                        {row.source}
                      </AdminTd>
                      <AdminTd label="Lang" className="px-3 py-2 sm:px-3 sm:py-2">
                        {row.language ?? "—"}
                      </AdminTd>
                      <AdminTd label="Payload" className="max-w-xl px-3 py-2 sm:px-3 sm:py-2">
                        <pre className="whitespace-pre-wrap break-all font-mono text-[var(--foreground-secondary)]">
                          {row.payload === null ? "—" : JSON.stringify(row.payload).slice(0, 1200)}
                        </pre>
                      </AdminTd>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminTablePanel>
          )}
        </>
      )}
    </AdminPageContainer>
  );
}
