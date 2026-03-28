import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

type Props = { params: Promise<{ slug: string }> };

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: "Promises" };
  }
  const member = await prisma.parliamentMember.findFirst({
    where: { slug, active: true },
    select: { name: true },
  });
  return {
    title: member ? `Promises — ${member.name}` : "Promises",
  };
}

export default async function PromisesByMemberPage({ params }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const { slug } = await params;
  const member = await prisma.parliamentMember.findFirst({
    where: { slug, active: true },
    include: {
      constituency: true,
      promises: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!member || member.promises.length === 0) notFound();

  return (
    <div>
      <PageHeader
        title={member.name}
        description={`${member.role}${member.party ? ` · ${member.party}` : ""}${member.constituency ? ` · ${member.constituency.name}` : ""} — campaign promises we are tracking.`}
        breadcrumbCurrentLabel={member.name}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/promises" className="text-[var(--primary)] hover:underline">
              ← All people
            </Link>
          </p>

          <ul className="mt-8 space-y-6">
            {member.promises.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{p.title}</h2>
                  <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                    {statusLabel(p.status)}
                  </span>
                </div>
                {p.description ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                    {p.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">Source:</span> {p.sourceLabel}
                  {p.sourceDate
                    ? ` · ${p.sourceDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}`
                    : ""}
                </p>
                <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                  Updated {p.updatedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
