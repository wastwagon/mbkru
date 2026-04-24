import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isTownHallDirectoryPageEnabled } from "@/lib/reports/accountability-pages";
import { programmeEventKindLabel } from "@/lib/programme-event-labels";
import { getProgrammeTownHallEvents } from "@/lib/server/town-hall-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Town halls & regional forums",
  description:
    "MBKRU town halls and regional listening forums — programme roadmap with citations. Confirmed dates are announced on News.",
};

function statusLabel(status: string) {
  switch (status) {
    case "TBC":
      return "To be confirmed";
    case "SCHEDULED":
      return "Scheduled";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

export default async function TownHallsPage() {
  if (!isTownHallDirectoryPageEnabled()) notFound();

  const events =
    isDatabaseConfigured() ? await getProgrammeTownHallEvents().catch(() => []) : [];

  return (
    <div>
      <PageHeader
        title="Town halls & regional forums"
        description="Presidential and regional listening sessions. Programme rows below follow our published roadmap; confirmed dates and venues are announced on News when partners sign off."
        breadcrumbCurrentLabel="Forums"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            We maintain a <strong className="text-[var(--foreground)]">programme directory</strong> tied to our{" "}
            <Link href="/" className={primaryNavLinkClass}>
              public roadmap
            </Link>
            . Rows marked <em>to be confirmed</em> are placeholders until venues and registration open. For data provenance on MPs
            and constituencies, see{" "}
            <Link href="/data-sources" className={primaryNavLinkClass}>
              Data sources
            </Link>
            . Constituency-level debate placeholders live on{" "}
            <Link href="/debates" className={primaryNavLinkClass}>
              Constituency debates
            </Link>
            .
          </p>

          {events.length === 0 ? (
            <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted-foreground)] shadow-sm">
              No programme rows in the database yet. Run <code className="rounded bg-[var(--section-light)] px-1">npx prisma migrate deploy</code>{" "}
              and <code className="rounded bg-[var(--section-light)] px-1">npx prisma db seed</code> (unless{" "}
              <code className="rounded bg-[var(--section-light)] px-1">SEED_TOWN_HALL_PROGRAMME=0</code>), or check{" "}
              <code className="rounded bg-[var(--section-light)] px-1">prisma/data/TOWN_HALL_SEED_SOURCES.txt</code>.
            </p>
          ) : (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-[var(--foreground)]">{ev.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                        {programmeEventKindLabel(ev.kind)}
                        {ev.constituency?.name ? ` · ${ev.constituency.name}` : ""}
                        {ev.programmeQuarter ? ` · ${ev.programmeQuarter}` : ""}
                        {" · "}
                        {ev.region?.name ?? "National / multi-region"}
                        {" · "}
                        <span className="font-medium text-[var(--foreground)]">{statusLabel(ev.status)}</span>
                      </p>
                    </div>
                  </div>
                  {ev.summary ? <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{ev.summary}</p> : null}
                  {ev.startsAt ? (
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                      Window: {new Date(ev.startsAt).toLocaleString("en-GB")}
                      {ev.endsAt ? ` – ${new Date(ev.endsAt).toLocaleString("en-GB")}` : null}
                    </p>
                  ) : null}
                  {ev.venueLine ? (
                    <p className="mt-2 text-sm text-[var(--foreground)]">
                      <span className="font-medium">Venue: </span>
                      {ev.venueLine}
                    </p>
                  ) : null}
                  {ev.infoUrl ? (
                    <p className="mt-2 text-sm">
                      <a href={ev.infoUrl} className={primaryNavLinkClass} rel="noopener noreferrer">
                        More information
                      </a>
                    </p>
                  ) : null}
                  {ev.sourceCitation ? (
                    <p className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">Reference: </span>
                      {ev.sourceCitation}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <p className="text-sm text-[var(--muted-foreground)]">
            <Link href="/news" className={primaryNavLinkClass}>
              News &amp; Updates
            </Link>{" "}
            for dated announcements, and{" "}
            <Link href="/contact" className={primaryNavLinkClass}>
              Contact
            </Link>{" "}
            to co-host a regional session.
          </p>
        </div>
      </section>
    </div>
  );
}
