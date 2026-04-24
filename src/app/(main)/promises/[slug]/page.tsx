import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PromiseEvidenceCard } from "@/components/accountability/PromiseEvidenceCard";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { getCachedPromisesMemberPublic } from "@/lib/server/accountability-cache";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) {
    return { title: accountabilityCatalogueNavMedium.byMp };
  }
  const member = await getCachedPromisesMemberPublic(slug.toLowerCase());
  return {
    title: member ? `${member.name} — ${accountabilityCatalogueNavMedium.byMp}` : accountabilityCatalogueNavMedium.byMp,
  };
}

export default async function PromisesByMemberPage({ params }: Props) {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const { slug } = await params;
  const member = await getCachedPromisesMemberPublic(slug.toLowerCase());

  if (!member) notFound();

  return (
    <div>
      <PageHeader
        title={member.name}
        description={`${member.role}${member.party ? ` · ${member.party}` : ""}${member.constituency ? ` · ${member.constituency.name}` : ""}${accountabilityProse.memberSheetMetaSuffix}`}
        breadcrumbCurrentLabel={member.name}
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href={ACCOUNTABILITY_CATALOGUE_ROUTES.promisesByMp} className={primaryNavLinkClass}>
              {accountabilityProse.mpRosterBackLink}
            </Link>
          </p>

          <ul className="mt-8 space-y-6">
            {member.promises.map((p) => (
              <li key={p.id} className="space-y-2">
                <PromiseEvidenceCard
                  title={p.title}
                  description={p.description}
                  status={p.status}
                  sourceLabel={p.sourceLabel}
                  sourceDate={p.sourceDate}
                  sourceUrl={p.sourceUrl}
                  verificationNotes={p.verificationNotes}
                  policySector={p.policySector}
                  manifestoDocument={
                    p.manifestoDocument
                      ? {
                          title: p.manifestoDocument.title,
                          sourceUrl: p.manifestoDocument.sourceUrl,
                        }
                      : null
                  }
                />
                <p className="px-1 text-[11px] text-[var(--muted-foreground)]">
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
