import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PetitionSignPanel } from "@/components/civic/PetitionSignPanel";
import { ShareTopicButton } from "@/components/civic/ShareTopicButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { isPetitionGuestEmailVerificationEnabled } from "@/lib/server/petition-guest-verification";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ verify?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug?.trim().toLowerCase() ?? "";
  if (!slug || !isCivicPetitionsAndPublicCausesEnabled()) return { title: "Petition" };
  const p = await prisma.petition.findUnique({
    where: { slug },
    select: { title: true, summary: true, status: true },
  });
  if (!p || p.status === "ARCHIVED") return { title: "Petition" };
  return {
    title: p.title,
    description: p.summary ?? p.title,
  };
}

export default async function PetitionDetailPage({ params, searchParams }: Props) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const slug = (await params).slug.trim().toLowerCase();
  if (!slug) notFound();

  const q = (await searchParams) ?? {};
  const guestEmailVerificationEnabled = isPetitionGuestEmailVerificationEnabled();

  const p = await prisma.petition.findUnique({
    where: { slug },
    include: {
      region: { select: { name: true } },
      author: { select: { displayName: true } },
      _count: { select: { signatures: true } },
    },
  });

  if (!p || p.status === "ARCHIVED") notFound();

  const recent = await prisma.petitionSignature.findMany({
    where: { petitionId: p.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { signerName: true, consentShowName: true, createdAt: true },
  });

  const session = await getMemberSession();
  let viewerSigned = false;
  let me: { email: string; displayName: string | null } | null = null;
  if (session) {
    const m = await prisma.member.findUnique({
      where: { id: session.memberId },
      select: { email: true, displayName: true },
    });
    if (m) {
      me = { email: m.email, displayName: m.displayName };
      const sig = await prisma.petitionSignature.findUnique({
        where: {
          petitionId_signerEmail: {
            petitionId: p.id,
            signerEmail: m.email.trim().toLowerCase(),
          },
        },
        select: { id: true },
      });
      viewerSigned = Boolean(sig);
    }
  }

  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const shareUrl = envBase.startsWith("http")
    ? `${envBase.replace(/\/$/, "")}/petitions/${encodeURIComponent(p.slug)}`
    : "";

  return (
    <div>
      <PageHeader
        title={p.title}
        description={p.summary ?? "Citizen petition on MBKRU."}
        breadcrumbCurrentLabel={p.title.slice(0, 40) + (p.title.length > 40 ? "…" : "")}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/petitions" className="text-[var(--primary)] hover:underline">
              ← All petitions
            </Link>
            {p.status === "CLOSED" ? (
              <span className="ml-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                Closed to new signatures
              </span>
            ) : null}
          </p>

          {q.verify === "confirmed" ? (
            <p
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
              role="status"
            >
              Your email is confirmed and your signature is now counted on this petition.
            </p>
          ) : null}

          {shareUrl ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ShareTopicButton url={shareUrl} title={p.title} summary={p.summary} />
            </div>
          ) : null}

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-xs text-[var(--muted-foreground)]">
              By {p.author.displayName ?? "Member"}
              {p.region?.name ? ` · ${p.region.name}` : ""} · Opened{" "}
              <time dateTime={p.createdAt.toISOString()}>{formatSubmissionDateTime(p.createdAt)}</time>
            </p>
            <div className="prose prose-sm mt-4 max-w-none text-[var(--foreground)]">
              <pre className="whitespace-pre-wrap font-sans text-sm">{p.body}</pre>
            </div>
          </div>

          {recent.length > 0 ? (
            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h2 className="font-display text-sm font-semibold text-[var(--foreground)]">Recent signers</h2>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
                {recent.map((s, i) => (
                  <li key={i}>
                    {s.consentShowName && s.signerName?.trim() ? s.signerName.trim() : "Supporter"} ·{" "}
                    <time dateTime={s.createdAt.toISOString()}>{formatSubmissionDateTime(s.createdAt)}</time>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-8">
            {p.status === "OPEN" ? (
              <PetitionSignPanel
                slug={p.slug}
                initialCount={p._count.signatures}
                initialViewerSigned={viewerSigned}
                targetSignatures={p.targetSignatures}
                me={me}
                guestEmailVerificationEnabled={guestEmailVerificationEnabled}
              />
            ) : (
              <p className="rounded-xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted-foreground)]">
                This petition is closed and no longer accepts signatures.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
