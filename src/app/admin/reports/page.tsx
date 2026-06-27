import Link from "next/link";

import type { CitizenReportIntakeSource, CitizenReportKind } from "@prisma/client";

import { isCitizenReportSlaOverdue } from "@/lib/admin/report-operations-datetime";
import { adminFilterChipClass } from "@/lib/admin/admin-ui-classes";
import { requireAdminSession } from "@/lib/admin/require-session";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";

const KIND_TABS: { param: string; label: string; description: string }[] = [
  { param: "", label: "All", description: "Every report kind" },
  { param: "VOICE", label: "Voice", description: "Citizen Voice reports" },
  { param: "MP_PERFORMANCE", label: "MP", description: "MP performance" },
  { param: "GOVERNMENT_PERFORMANCE", label: "Gov", description: "Government performance" },
  { param: "SITUATIONAL_ALERT", label: "Situational", description: "Situational alerts" },
  { param: "ELECTION_OBSERVATION", label: "Election", description: "Election observation" },
];

function parseKindParam(raw: string | string[] | undefined): CitizenReportKind | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return undefined;
  const allowed: CitizenReportKind[] = [
    "VOICE",
    "MP_PERFORMANCE",
    "GOVERNMENT_PERFORMANCE",
    "SITUATIONAL_ALERT",
    "ELECTION_OBSERVATION",
  ];
  return allowed.includes(v as CitizenReportKind) ? (v as CitizenReportKind) : undefined;
}

function parseIntakeParam(raw: string | string[] | undefined): CitizenReportIntakeSource | undefined {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (v === "council") return "COUNCIL_EVALUATION";
  if (v === "citizen") return "CITIZEN_VOICE";
  return undefined;
}

function reportsListHref(kind?: CitizenReportKind, intake?: CitizenReportIntakeSource): string {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (intake) params.set("intake", intake === "COUNCIL_EVALUATION" ? "council" : "citizen");
  const q = params.toString();
  return q ? `/admin/reports?${q}` : "/admin/reports";
}

type Props = {
  searchParams?: Promise<{ kind?: string | string[]; intake?: string | string[] }>;
};

export default async function AdminReportsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const kindFilter = parseKindParam(sp.kind);
  const intakeFilter = parseIntakeParam(sp.intake);

  const reports = await prisma.citizenReport.findMany({
    where: {
      ...(kindFilter ? { kind: kindFilter } : {}),
      ...(intakeFilter ? { intakeSource: intakeFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      region: { select: { name: true } },
      community: { select: { name: true } },
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

  const showIntakeFilters = !kindFilter || kindFilter === "MP_PERFORMANCE";

  return (
    <AdminPageContainer>
      <AdminPageHeader
        title="Citizen reports"
        description={
          <>
            <p>Triage by kind below. Open a report for status, operations fields, staff notes, and history.</p>
            <p className="mt-2">
              Outbound email for status changes and submitter-visible notes uses Resend when it is configured.
            </p>
            <p className="mt-2 text-sm">
              <Link href="/admin/analytics/citizen-reports" className={primaryLinkClass}>
                Aggregate analytics
              </Link>
              <span className="text-[var(--foreground-secondary)]">
                {" "}
                — counts by kind, status, region, playbook; no personal data.
              </span>
            </p>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by report kind">
        {KIND_TABS.map((t) => {
          const active = (t.param === "" && !kindFilter) || t.param === kindFilter;
          const href =
            t.param === ""
              ? reportsListHref(undefined, intakeFilter)
              : reportsListHref(t.param as CitizenReportKind, intakeFilter);
          return (
            <Link
              key={t.param || "all"}
              href={href}
              scroll={false}
              className={adminFilterChipClass(active)}
              aria-current={active ? "page" : undefined}
              title={t.description}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {showIntakeFilters ? (
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter MP intake source">
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", undefined)}
            scroll={false}
            className={adminFilterChipClass(!intakeFilter && kindFilter === "MP_PERFORMANCE")}
            aria-current={!intakeFilter && kindFilter === "MP_PERFORMANCE" ? "page" : undefined}
          >
            All MP intakes
          </Link>
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", "CITIZEN_VOICE")}
            scroll={false}
            className={adminFilterChipClass(intakeFilter === "CITIZEN_VOICE")}
            aria-current={intakeFilter === "CITIZEN_VOICE" ? "page" : undefined}
          >
            Citizen Voice MP
          </Link>
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", "COUNCIL_EVALUATION")}
            scroll={false}
            className={adminFilterChipClass(intakeFilter === "COUNCIL_EVALUATION")}
            aria-current={intakeFilter === "COUNCIL_EVALUATION" ? "page" : undefined}
          >
            Council evaluation
          </Link>
        </div>
      ) : null}

      <AdminListPanel className="mt-6">
        {reports.length === 0 ? (
          <li className="p-6 text-sm text-[var(--foreground-secondary)]">No reports yet.</li>
        ) : (
          reports.map((r) => {
            const slaOverdue = isCitizenReportSlaOverdue(r.slaDueAt, r.status);
            return (
            <li key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-[var(--foreground)] line-clamp-1">{r.title}</p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  <span className="font-mono">{r.trackingCode}</span> · {r.kind.replace(/_/g, " ")} ·{" "}
                  <span className="text-[var(--primary)]">{r.status.replace(/_/g, " ")}</span>
                  {r.intakeSource === "COUNCIL_EVALUATION" ? (
                    <span className="ml-1 rounded bg-[var(--accent-gold-light)] px-1.5 py-0.5 font-semibold text-[var(--foreground)]">
                      Council
                    </span>
                  ) : null}
                  {r.community ? ` · ${r.community.name}` : r.region ? ` · ${r.region.name}` : ""}
                  {slaOverdue ? (
                    <span className="ml-1 font-semibold text-amber-800">· SLA overdue</span>
                  ) : null}
                </p>
                <p className="text-xs text-[var(--foreground-secondary)]">
                  {r.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
                {r._count.adminReplies > 0 ? (
                  <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
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
              <Link href={`/admin/reports/${r.id}`} className={`${primaryNavLinkClass} shrink-0 text-sm font-semibold`}>
                Review
              </Link>
            </li>
            );
          })
        )}
      </AdminListPanel>

    </AdminPageContainer>
  );
}
