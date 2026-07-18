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
  title: "Town halls & regional forums",
  description:
    "MBKRU town halls and regional listening forums — programme calendar with citations. Confirmed dates are announced on News.",
};

export default async function TownHallsPage() {
  if (!isTownHallDirectoryPageEnabled()) notFound();

  const events =
    isDatabaseConfigured() ? await getProgrammeTownHallEvents().catch(() => []) : [];

  return (
    <div>
      <PageHeader
        title="Town halls & regional forums"
        description="Presidential and regional listening sessions. Programme rows below follow our published calendar; confirmed dates and venues are announced on News when partners sign off."
        breadcrumbCurrentLabel="Forums"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-[var(--foreground-secondary)]">
            We maintain a <strong className="text-[var(--foreground)]">programme directory</strong> tied to our{" "}
            <Link href="/" className={primaryNavLinkClass}>
              published programme pathway
            </Link>
            . Rows marked <em>to be confirmed</em> are provisional until venues and registration open. For data provenance on MPs
            and constituencies, see{" "}
            <Link href="/data-sources" className={primaryNavLinkClass}>
              Data sources
            </Link>
            . Constituency-level debates are listed on{" "}
            <Link href="/debates" className={primaryNavLinkClass}>
              Constituency debates
            </Link>
            .
          </p>

          {events.length === 0 ? (
            <ProgrammeEventsEmptyState message="No town halls or regional forums are listed yet. Confirmed dates and venues will appear here and on News." />
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
              News &amp; announcements
            </Link>
            {" · "}
            <Link href="/contact" className={primaryNavLinkClass}>
              Contact
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
