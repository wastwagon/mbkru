import Link from "next/link";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel } from "@/lib/report-status-text";

import type { CitizenReportKind } from "@prisma/client";

type QueueFilter = "all" | "draft" | "live" | "closed";

function parseFilter(raw: string | string[] | undefined): QueueFilter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "draft" || v === "live" || v === "closed") return v;
  return "all";
}

type Row = {
  id: string;
  trackingCode: string;
  title: string;
  kind: CitizenReportKind;
  publicCauseSlug: string | null;
  publicCauseTitle: string | null;
  publicCauseOpenedAt: Date | null;
  publicCauseClosed: boolean;
  region: { name: string } | null;
  _count: { publicCauseSupports: number; publicCauseComments: number };
};

function inPublicCauseQueue(r: Row): boolean {
  const slug = r.publicCauseSlug?.trim() ?? "";
  return r.publicCauseOpenedAt != null || slug.length > 0;
}

function rowFilter(r: Row, f: QueueFilter): boolean {
  if (f === "all") return true;
  const slug = r.publicCauseSlug?.trim() ?? "";
  const hasSlug = slug.length > 0;
  const opened = r.publicCauseOpenedAt != null;
  if (f === "draft") return hasSlug && !opened;
  if (f === "live") return opened && !r.publicCauseClosed;
  if (f === "closed") return opened && r.publicCauseClosed;
  return true;
}

type Props = { searchParams?: Promise<{ view?: string | string[] }> };

export default async function AdminPublicCausesPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const view = parseFilter(sp.view);

  const raw = await prisma.citizenReport.findMany({
    where: {
      OR: [{ publicCauseOpenedAt: { not: null } }, { publicCauseSlug: { not: null } }],
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
    select: {
      id: true,
      trackingCode: true,
      title: true,
      kind: true,
      publicCauseSlug: true,
      publicCauseTitle: true,
      publicCauseOpenedAt: true,
      publicCauseClosed: true,
      region: { select: { name: true } },
      _count: { select: { publicCauseSupports: true, publicCauseComments: true } },
    },
  });

  const queue = raw.filter(inPublicCauseQueue).filter((r) => rowFilter(r, view));

  const counts = {
    all: raw.filter(inPublicCauseQueue).length,
    draft: raw.filter(inPublicCauseQueue).filter((r) => rowFilter(r, "draft")).length,
    live: raw.filter(inPublicCauseQueue).filter((r) => rowFilter(r, "live")).length,
    closed: raw.filter(inPublicCauseQueue).filter((r) => rowFilter(r, "closed")).length,
  };

  const tabs: { key: QueueFilter; label: string; hint: string }[] = [
    { key: "all", label: "All", hint: "Draft + live + closed" },
    { key: "draft", label: "Draft", hint: "Slug saved, not published" },
    { key: "live", label: "Live", hint: "Public page accepting engagement" },
    { key: "closed", label: "Closed", hint: "Read-only on site" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--muted-foreground)]">
        <Link href="/admin" className={primaryLinkClass}>
          ← Admin home
        </Link>
      </p>
      <h1 className="mt-4 font-display text-2xl font-bold text-[var(--foreground)]">Public causes</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Voice reports with a public-thread URL or publish timestamp. Edit summaries and moderation on each report&apos;s
        admin page.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter queue">
        {tabs.map((t) => {
          const active = view === t.key;
          const href = t.key === "all" ? "/admin/public-causes" : `/admin/public-causes?view=${t.key}`;
          return (
            <Link
              key={t.key}
              href={href}
              scroll={false}
              title={t.hint}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {t.label}
              <span className="ml-1.5 tabular-nums opacity-80">({counts[t.key]})</span>
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {queue.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">Nothing in this view.</li>
        ) : (
          queue.map((r) => {
            const slug = r.publicCauseSlug?.trim() ?? "";
            const opened = r.publicCauseOpenedAt != null;
            const badge =
              !opened && slug
                ? { text: "Draft", className: "bg-slate-100 text-slate-800" }
                : opened && r.publicCauseClosed
                  ? { text: "Closed", className: "bg-amber-100 text-amber-950" }
                  : opened
                    ? { text: "Live", className: "bg-emerald-100 text-emerald-950" }
                    : { text: "—", className: "bg-[var(--section-light)] text-[var(--muted-foreground)]" };

            return (
              <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge.className}`}>
                      {badge.text}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">{reportKindLabel(r.kind)}</span>
                  </div>
                  <p className="mt-1 font-semibold text-[var(--foreground)] line-clamp-2">
                    {r.publicCauseTitle?.trim() || r.title}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{r.trackingCode}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {r.region?.name ? `${r.region.name} · ` : null}
                    {r._count.publicCauseSupports} support · {r._count.publicCauseComments} comments
                  </p>
                  {slug && opened ? (
                    <p className="mt-1 text-xs">
                      <Link
                        href={`/citizens-voice/causes/${encodeURIComponent(slug)}`}
                        className={primaryLinkClass}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open public page
                      </Link>
                    </p>
                  ) : slug && !opened ? (
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Slug <code className="rounded bg-[var(--section-light)] px-1">{slug}</code> — check &quot;Publish&quot;
                      on the report to go live.
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/admin/reports/${r.id}`}
                  className="shrink-0 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/60 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--section-light)]"
                >
                  Edit thread
                </Link>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
