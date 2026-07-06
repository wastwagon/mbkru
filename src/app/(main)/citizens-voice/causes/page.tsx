import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel } from "@/lib/report-status-text";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { mergeCitizenReportWhere } from "@/lib/reports/training-data";

import type { CitizenReportKind } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public causes",
  description:
    "MBKRU Voice submissions opened by editors as public threads — members show support, read the summary, and comment. Full intake stays private.",
};

export default async function PublicCausesIndexPage() {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const causes = await prisma.citizenReport.findMany({
    where: mergeCitizenReportWhere({
      publicCauseOpenedAt: { not: null },
      publicCauseClosed: false,
      publicCauseSlug: { not: null },
    }),
    orderBy: { publicCauseOpenedAt: "desc" },
    take: 40,
    include: {
      region: { select: { name: true } },
      _count: { select: { publicCauseSupports: true, publicCauseComments: true } },
    },
  });

  const rows = causes.filter((c) => c.publicCauseSlug && c.publicCauseTitle && c.publicCauseSummary);

  return (
    <div>
      <PageHeader
        title="Public causes"
        description="When staff publish a Voice submission here, it appears on this list with an editor-approved summary (not the full report). Other members can show support and join the discussion on each cause — sign in to comment. Use petitions if you want a separate signature campaign."
        breadcrumbCurrentLabel="Causes"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Editor-approved summaries from MBKRU Voice — not the full citizen report. Sign in to comment and show
            support.{" "}
            <Link href="/petitions" className={primaryNavLinkClass}>
              Petitions
            </Link>
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--foreground-secondary)]">
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              MBKRU Voice
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/transparency" className={primaryNavLinkClass}>
              Voice statistics
            </Link>
          </p>

          {rows.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
              No public causes yet. When editors open a submitted Voice report as a public thread, it will show here for
              others to support and discuss.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {rows.map((c) => {
                const href = `/citizens-voice/causes/${encodeURIComponent(c.publicCauseSlug!)}`;
                const metaParts = [
                  reportKindLabel(c.kind as CitizenReportKind),
                  c.region?.name,
                  `${c._count.publicCauseSupports} support`,
                  `${c._count.publicCauseComments} comments`,
                ].filter(Boolean);

                return (
                  <li key={c.id}>
                    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="min-w-0 flex-1 text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
                          <Link href={href} className="hover:text-[var(--primary)]">
                            {c.publicCauseTitle}
                          </Link>
                        </h2>
                        <span className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary-dark)]">
                          Public cause
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
                        {c.publicCauseSummary}
                      </p>
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                          href={href}
                          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
                        >
                          Join discussion
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
