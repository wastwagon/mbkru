import Link from "next/link";

import type { CitizenReportIntakeSource, CitizenReportKind } from "@prisma/client";

import { TrainingReportBadge } from "@/components/admin/TrainingReportBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminListPanel } from "@/components/admin/AdminListPanel";
import { AdminPageContainer } from "@/components/admin/AdminPageContainer";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { isCitizenReportSlaOverdue } from "@/lib/admin/report-operations-datetime";
import { adminFilterChipClass } from "@/lib/admin/admin-ui-classes";
import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { primaryLinkClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import {
  isTrainingCitizenReport,
  trainingCitizenReportMatchWhere,
} from "@/lib/reports/training-data";

const KIND_TABS: { param: string; label: string; description: string }[] = [
  { param: "", label: "All", description: "Every report kind" },
  { param: "VOICE", label: "Voice", description: "Citizen Voice reports" },
  { param: "MP_PERFORMANCE", label: "MP", description: "MP performance" },
  { param: "GOVERNMENT_PERFORMANCE", label: "Gov", description: "Government performance" },
  { param: "SITUATIONAL_ALERT", label: "Situational", description: "Situational alerts" },
  { param: "ELECTION_OBSERVATION", label: "Election", description: "Election observation" },
];

type TrainingFilter = "all" | "real" | "training";

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

function parseTrainingParam(raw: string | string[] | undefined): TrainingFilter {
  const v = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase();
  if (v === "real" || v === "training") return v;
  return "all";
}

function reportsListHref(
  kind?: CitizenReportKind,
  intake?: CitizenReportIntakeSource,
  training: TrainingFilter = "all",
): string {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (intake) params.set("intake", intake === "COUNCIL_EVALUATION" ? "council" : "citizen");
  if (training !== "all") params.set("training", training);
  const q = params.toString();
  return q ? `/admin/reports?${q}` : "/admin/reports";
}

type Props = {
  searchParams?: Promise<{
    kind?: string | string[];
    intake?: string | string[];
    training?: string | string[];
  }>;
};

export default async function AdminReportsPage({ searchParams }: Props) {
  await requireAdminSession();

  const sp = (await searchParams) ?? {};
  const kindFilter = parseKindParam(sp.kind);
  const intakeFilter = parseIntakeParam(sp.intake);
  const trainingFilter = parseTrainingParam(sp.training);

  const [reports, trainingOpenCount] = await Promise.all([
    prisma.citizenReport.findMany({
      where: {
        ...(kindFilter ? { kind: kindFilter } : {}),
        ...(intakeFilter ? { intakeSource: intakeFilter } : {}),
        ...(trainingFilter === "training"
          ? trainingCitizenReportMatchWhere()
          : trainingFilter === "real"
            ? { NOT: trainingCitizenReportMatchWhere() }
            : {}),
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
    }),
    prisma.citizenReport.count({
      where: {
        status: { not: "ARCHIVED" },
        ...trainingCitizenReportMatchWhere(),
      },
    }),
  ]);

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

      {trainingOpenCount > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">
            {trainingOpenCount} open training / demo report{trainingOpenCount === 1 ? "" : "s"} in the database
          </p>
          <p className="mt-1 text-amber-900/90">
            Rows with <code className="text-[11px]">MBKRU-DEMO-</code> / <code className="text-[11px]">MBKRU-SEED-</code>{" "}
            codes (or “Testing Phase” titles) are for staff practice — not real citizen intake. Filter to{" "}
            <Link href={reportsListHref(kindFilter, intakeFilter, "real")} className={primaryLinkClass}>
              Real only
            </Link>{" "}
            when loading live content, or archive training rows via{" "}
            <code className="text-[11px]">npm run ops:archive-training-reports</code> (see Settings → Launch readiness).
          </p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter by report kind">
        {KIND_TABS.map((t) => {
          const active = (t.param === "" && !kindFilter) || t.param === kindFilter;
          const href =
            t.param === ""
              ? reportsListHref(undefined, intakeFilter, trainingFilter)
              : reportsListHref(t.param as CitizenReportKind, intakeFilter, trainingFilter);
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

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter training vs real reports">
        {(
          [
            { key: "all" as const, label: "All rows" },
            { key: "real" as const, label: "Real only" },
            { key: "training" as const, label: "Training only" },
          ] as const
        ).map((t) => (
          <Link
            key={t.key}
            href={reportsListHref(kindFilter, intakeFilter, t.key)}
            scroll={false}
            className={adminFilterChipClass(trainingFilter === t.key)}
            aria-current={trainingFilter === t.key ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {showIntakeFilters ? (
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter MP intake source">
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", undefined, trainingFilter)}
            scroll={false}
            className={adminFilterChipClass(!intakeFilter && kindFilter === "MP_PERFORMANCE")}
            aria-current={!intakeFilter && kindFilter === "MP_PERFORMANCE" ? "page" : undefined}
          >
            All MP intakes
          </Link>
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", "CITIZEN_VOICE", trainingFilter)}
            scroll={false}
            className={adminFilterChipClass(intakeFilter === "CITIZEN_VOICE")}
            aria-current={intakeFilter === "CITIZEN_VOICE" ? "page" : undefined}
          >
            Citizen Voice MP
          </Link>
          <Link
            href={reportsListHref(kindFilter ?? "MP_PERFORMANCE", "COUNCIL_EVALUATION", trainingFilter)}
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
          <li className="p-6">
            <AdminEmptyState
              title="No reports in this view"
              message={
                trainingFilter === "real"
                  ? "No real (non-training) reports match these filters yet."
                  : trainingFilter === "training"
                    ? "No training/demo reports match these filters."
                    : "Citizen reports will appear here as Voice and related channels receive submissions."
              }
              action={
                trainingFilter !== "all"
                  ? { href: reportsListHref(kindFilter, intakeFilter, "all"), label: "Show all rows" }
                  : { href: "/admin/analytics/citizen-reports", label: "View analytics" }
              }
            />
          </li>
        ) : (
          reports.map((r) => {
            const slaOverdue = isCitizenReportSlaOverdue(r.slaDueAt, r.status);
            const training = isTrainingCitizenReport(r);
            return (
              <li
                key={r.id}
                className={`flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between ${
                  training ? "bg-amber-50/40" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-[var(--foreground)]">
                    <span className="line-clamp-1">{r.title}</span>
                    <TrainingReportBadge trackingCode={r.trackingCode} title={r.title} />
                  </p>
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
