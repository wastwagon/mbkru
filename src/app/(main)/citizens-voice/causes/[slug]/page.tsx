import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicCauseEngagement } from "@/components/civic/PublicCauseEngagement";
import { ShareTopicButton } from "@/components/civic/ShareTopicButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel } from "@/lib/report-status-text";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

import type { CitizenReportKind } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.trim().toLowerCase() ?? "";
  if (!slug) return { title: "Cause" };
  const r = await prisma.citizenReport.findFirst({
    where: { publicCauseSlug: slug, publicCauseOpenedAt: { not: null } },
    select: { publicCauseTitle: true, publicCauseSummary: true },
  });
  if (!r?.publicCauseTitle) return { title: "Cause" };
  return {
    title: r.publicCauseTitle,
    description: r.publicCauseSummary?.slice(0, 160) ?? r.publicCauseTitle,
  };
}

export default async function PublicCauseDetailPage({ params }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const slug = (await params).slug.trim().toLowerCase();
  if (!slug) notFound();

  const report = await prisma.citizenReport.findFirst({
    where: {
      publicCauseSlug: slug,
      publicCauseOpenedAt: { not: null },
    },
    include: {
      region: { select: { name: true } },
      _count: { select: { publicCauseSupports: true } },
    },
  });

  if (!report?.publicCauseTitle || !report.publicCauseSummary) notFound();

  const comments = await prisma.citizenReportPublicComment.findMany({
    where: { reportId: report.id, status: "VISIBLE" },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      body: true,
      createdAt: true,
      member: { select: { displayName: true } },
    },
  });

  const session = await getMemberSession();
  let viewerSupported = false;
  if (session) {
    const s = await prisma.citizenReportSupport.findUnique({
      where: {
        reportId_memberId: { reportId: report.id, memberId: session.memberId },
      },
      select: { reportId: true },
    });
    viewerSupported = Boolean(s);
  }

  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const shareUrl = envBase.startsWith("http")
    ? `${envBase.replace(/\/$/, "")}/citizens-voice/causes/${encodeURIComponent(slug)}`
    : "";

  return (
    <div>
      <PageHeader
        title={report.publicCauseTitle}
        description={report.publicCauseSummary.slice(0, 280) + (report.publicCauseSummary.length > 280 ? "…" : "")}
        breadcrumbCurrentLabel={
          report.publicCauseTitle.length > 42
            ? `${report.publicCauseTitle.slice(0, 42)}…`
            : report.publicCauseTitle
        }
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/citizens-voice/causes" className={primaryNavLinkClass}>
              ← All causes
            </Link>
            {" · "}
            <span>{reportKindLabel(report.kind as CitizenReportKind)}</span>
            {report.region?.name ? ` · ${report.region.name}` : ""}
            {report.publicCauseClosed ? (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                Closed
              </span>
            ) : null}
          </p>

          {shareUrl ? (
            <div className="mt-4">
              <ShareTopicButton
                url={shareUrl}
                title={report.publicCauseTitle}
                summary={report.publicCauseSummary}
              />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Public summary
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--foreground)]">{report.publicCauseSummary}</p>
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Opened {report.publicCauseOpenedAt?.toLocaleDateString("en-GB")}. Full original submission is not shown
              here.
            </p>
          </div>

          <div className="mt-8">
            <PublicCauseEngagement
              slug={slug}
              initialSupportCount={report._count.publicCauseSupports}
              initialViewerSupported={viewerSupported}
              initialComments={comments.map((c) => ({
                id: c.id,
                body: c.body,
                createdAt: c.createdAt.toISOString(),
                authorLabel: c.member.displayName?.trim() || "Member",
              }))}
              closed={report.publicCauseClosed}
              signedIn={Boolean(session)}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
