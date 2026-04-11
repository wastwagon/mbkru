import Link from "next/link";

import type { CitizenReportKind } from "@prisma/client";

import { isCitizenReportSlaOverdue } from "@/lib/admin/report-operations-datetime";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

const KIND_TABS: { param: string; label: string; description: string }[] = [
  { param: "", label: "All", description: "Every report kind" },
  { param: "VOICE", label: "Voice", description: "MBKRU Voice" },
  { param: "SITUATIONAL_ALERT", label: "Situational", description: "Situational alerts" },
  { param: "ELECTION_OBSERVATION", label: "Election", description: "Election observation" },
];

function parseKindParam(raw: string | string[] | undefined): CitizenReportKind | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return undefined;
  const allowed: CitizenReportKind[] = ["VOICE", "SITUATIONAL_ALERT", "ELECTION_OBSERVATION"];
  return allowed.includes(v as CitizenReportKind) ? (v as CitizenReportKind) : undefined;
}

type Props = { searchParams?: Promise<{ kind?: string | string[] }> };

export default async function AdminReportsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const kindFilter = parseKindParam(sp.kind);

  const reports = await prisma.citizenReport.findMany({
    where: kindFilter ? { kind: kindFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      region: { select: { name: true } },
      adminReplies: {
        where: { visibleToSubmitter: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
      _count: { select: { adminReplies: true } },
    },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">Citizen reports</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Triage by kind or open a row for status, staff notes, and audit. Status and team-note emails use Resend when
        configured.
      </p>
      <p className="mt-3 text-sm">
        <Link
          href="/admin/analytics/citizen-reports"
          className="font-medium text-[var(--primary)] hover:underline"
        >
          Aggregate analytics
        </Link>
        <span className="text-[var(--muted-foreground)]"> — counts by kind, status, region, playbook; no personal data.</span>
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by report kind">
        {KIND_TABS.map((t) => {
          const active = (t.param === "" && !kindFilter) || t.param === kindFilter;
          const href = t.param ? `/admin/reports?kind=${encodeURIComponent(t.param)}` : "/admin/reports";
          return (
            <Link
              key={t.param || "all"}
              href={href}
              scroll={false}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--primary)]/40"
              }`}
              aria-current={active ? "page" : undefined}
              title={t.description}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <ul className="mt-6 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
        {reports.length === 0 ? (
          <li className="p-6 text-sm text-[var(--muted-foreground)]">No reports yet.</li>
        ) : (
          reports.map((r) => {
            const slaOverdue = isCitizenReportSlaOverdue(r.slaDueAt, r.status);
            return (
            <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)] line-clamp-1">{r.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-mono">{r.trackingCode}</span> · {r.kind.replace(/_/g, " ")} ·{" "}
                  <span className="text-[var(--primary)]">{r.status.replace(/_/g, " ")}</span>
                  {r.region ? ` · ${r.region.name}` : ""}
                  {slaOverdue ? (
                    <span className="ml-1 font-semibold text-amber-800">· SLA overdue</span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {r._count.adminReplies > 0 ? (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    <span className="font-medium text-[var(--foreground)]">{r._count.adminReplies}</span> staff note
                    {r._count.adminReplies === 1 ? "" : "s"}
                    {r.adminReplies[0]?.createdAt ? (
                      <>
                        {" "}
                        · Latest to submitter{" "}
                        {r.adminReplies[0].createdAt.toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </>
                    ) : (
                      <span className="text-amber-800"> · all hidden from submitter</span>
                    )}
                  </p>
                ) : null}
              </div>
              <Link
                href={`/admin/reports/${r.id}`}
                className="shrink-0 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                Review
              </Link>
            </li>
            );
          })
        )}
      </ul>

      <p className="mt-8">
        <Link href="/admin" className="text-sm text-[var(--primary)] hover:underline">
          ← Dashboard
        </Link>
      </p>
    </div>
  );
}
