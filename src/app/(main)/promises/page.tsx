import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import {
  ACCOUNTABILITY_CATALOGUE_ROUTES,
  accountabilityCatalogueNavMedium,
  accountabilityProse,
} from "@/config/accountability-catalogue-destinations";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { getCachedPromisesIndexMembers } from "@/lib/server/accountability-cache";
import { isPromisesBrowseEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: accountabilityCatalogueNavMedium.byMp,
  description: "Track documented commitments from MPs and ministers — sources and status in one place.",
};

export default async function PromisesIndexPage() {
  if (!isPromisesBrowseEnabled() || !isDatabaseConfigured()) notFound();

  const members = await getCachedPromisesIndexMembers();

  return (
    <div>
      <PageHeader
        title={accountabilityCatalogueNavMedium.byMp}
        description="Documented commitments we are tracking. Each row links to sources and current status. This is not a legal finding — see our methodology for how we work."
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises}
              className="text-[var(--primary)] hover:underline"
            >
              {accountabilityCatalogueNavMedium.browseAll}
            </Link>
            {" · "}
            <Link
              href={ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments}
              className="text-[var(--primary)] hover:underline"
            >
              {accountabilityCatalogueNavMedium.government}
            </Link>
            {" · "}
            <Link href="/methodology" className="text-[var(--primary)] hover:underline">
              Accountability methodology
            </Link>
            {" · "}
            <Link href="/parliament-tracker" className="text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>
          </p>

          {members.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              {accountabilityProse.promisesIndexEmptyState}
            </p>
          ) : (
            <ul className="mt-10 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white">
              {members.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/promises/${encodeURIComponent(m.slug)}`}
                    className="flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-[var(--section-light)]/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--foreground)]">{m.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {m.role}
                        {m.party ? ` · ${m.party}` : ""}
                        {m.constituency ? ` · ${m.constituency.name}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-[var(--primary)]">
                      {m._count.promises} catalogue row{m._count.promises === 1 ? "" : "s"} →
                    </span>
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
