import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
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
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">Database not configured.</p>
      ) : (
        <>
          <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-[var(--border)] bg-white p-4">
            <div>
              <label htmlFor="q" className="block text-xs font-medium text-[var(--muted-foreground)]">
                Filter name contains
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                maxLength={120}
                className="mt-1 w-48 rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
              />
            </div>
            <button type="submit" className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]">
              Apply
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)]">
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
            <AdminEmptyState className="mt-8" message="No events in view." />
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)] bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <tr>
                    <th className="whitespace-nowrap px-3 py-2 font-medium">Time (UTC)</th>
                    <th className="px-3 py-2 font-medium">Event</th>
                    <th className="px-3 py-2 font-medium">Source</th>
                    <th className="px-3 py-2 font-medium">Lang</th>
                    <th className="min-w-[12rem] px-3 py-2 font-medium">Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row) => (
                    <tr key={String(row.id)} className="border-b border-[var(--border)] align-top text-xs">
                      <td className="whitespace-nowrap px-3 py-2 font-mono text-[var(--muted-foreground)]">
                        {row.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                      </td>
                      <td className="px-3 py-2">
                        <code>{row.eventName}</code>
                      </td>
                      <td className="px-3 py-2">{row.source}</td>
                      <td className="px-3 py-2">{row.language ?? "—"}</td>
                      <td className="max-w-xl px-3 py-2">
                        <pre className="whitespace-pre-wrap break-all font-mono text-[var(--muted-foreground)]">
                          {row.payload === null ? "—" : JSON.stringify(row.payload).slice(0, 1200)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AdminPageContainer>
  );
}
