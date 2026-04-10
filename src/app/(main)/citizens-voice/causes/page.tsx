import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { reportKindLabel } from "@/lib/report-status-text";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

import type { CitizenReportKind } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public causes",
  description:
    "Staff-approved public threads from MBKRU Voice — show support and discuss (sign-in). Original reports stay private.",
};

export default async function PublicCausesIndexPage() {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const causes = await prisma.citizenReport.findMany({
    where: {
      publicCauseOpenedAt: { not: null },
      publicCauseClosed: false,
      publicCauseSlug: { not: null },
    },
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
        description="These pages show editor-approved summaries only — not full Voice intake text. Members can signal support and discuss constructively. Start a petition if you want a standalone signature campaign."
        breadcrumbCurrentLabel="Causes"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice" className="text-[var(--primary)] hover:underline">
              MBKRU Voice
            </Link>
            {" · "}
            <Link href="/petitions" className="text-[var(--primary)] hover:underline">
              Petitions
            </Link>
            {" · "}
            <Link href="/transparency" className="text-[var(--primary)] hover:underline">
              Voice statistics
            </Link>
          </p>

          {rows.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              No public causes yet. Editors publish threads from admin after verifying a sanitized summary.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/citizens-voice/causes/${encodeURIComponent(c.publicCauseSlug!)}`}
                    className="block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--primary)]/30"
                  >
                    <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                      {c.publicCauseTitle}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--muted-foreground)]">{c.publicCauseSummary}</p>
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                      {reportKindLabel(c.kind as CitizenReportKind)}
                      {c.region?.name ? ` · ${c.region.name}` : ""} · {c._count.publicCauseSupports} support ·{" "}
                      {c._count.publicCauseComments} comments
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
