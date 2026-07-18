import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProgrammeEventCard, ProgrammeEventsEmptyState } from "@/components/programme/ProgrammeEventCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isTownHallDirectoryPageEnabled } from "@/lib/reports/accountability-pages";
import { getProgrammeTownHallEvents } from "@/lib/server/town-hall-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Constituency debates",
  description:
    "MBKRU programme planning for pre-election constituency debates — working toward nationwide coverage before Ghana 2028.",
};

export default async function ConstituencyDebatesPage() {
  if (!isTownHallDirectoryPageEnabled()) notFound();

  const events =
    isDatabaseConfigured()
      ? await getProgrammeTownHallEvents({ kind: "CONSTITUENCY_DEBATE" }).catch(() => [])
      : [];

  return (
    <div>
      <PageHeader
        title="Constituency debates"
        description="Programme planning toward pre-election debates in every constituency before Ghana 2028. Rows below stay provisional until partners, media, and the EC framework confirm schedules."
        breadcrumbCurrentLabel="Debates"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-[var(--foreground-secondary)]">
            This index lists only <strong className="text-[var(--foreground)]">constituency debate</strong> programme types. Regional town halls
            and broadcast forums are on{" "}
            <Link href="/town-halls" className={primaryNavLinkClass}>
              Town halls &amp; forums
            </Link>
            . Citations: see{" "}
            <Link href="/data-sources" className={primaryNavLinkClass}>
              Data sources
            </Link>
            .
          </p>

          {events.length === 0 ? (
            <ProgrammeEventsEmptyState message="No constituency debates are listed yet. Confirmed schedules will appear here when partners and the electoral framework are ready." />
          ) : (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li key={ev.id}>
                  <ProgrammeEventCard
                    title={ev.title}
                    kind={ev.kind}
                    status={ev.status}
                    summary={ev.summary}
                    programmeQuarter={ev.programmeQuarter}
                    startsAt={ev.startsAt}
                    endsAt={ev.endsAt}
                    venueLine={ev.venueLine}
                    infoUrl={ev.infoUrl}
                    sourceCitation={ev.sourceCitation}
                    regionName={ev.region?.name ?? null}
                    constituencyName={ev.constituency?.name ?? null}
                    featuredImage={ev.featuredMedia}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm text-[var(--foreground-secondary)]">
            <Link href="/news" className={primaryNavLinkClass}>
              News
            </Link>{" "}
            for confirmed dates ·{" "}
            <Link href="/contact" className={primaryNavLinkClass}>
              Contact
            </Link>{" "}
            for media partnerships.
          </p>
        </div>
      </section>
    </div>
  );
}
