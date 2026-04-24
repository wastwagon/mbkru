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
  title: "Constituency debates",
  description:
    "MBKRU programme placeholders for pre-election constituency debates — roadmap toward 275 constituencies (Ghana 2028).",
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
        description="Programme planning toward pre-election debates in every constituency before Ghana 2028. Rows below are placeholders until partners, media, and the EC framework confirm schedules."
        breadcrumbCurrentLabel="Debates"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
            This index lists only <strong className="text-[var(--foreground)]">constituency debate</strong> programme types. Regional town halls
            and broadcast forums are on{" "}
            <Link href="/town-halls" className={primaryNavLinkClass}>
              Town halls &amp; forums
            </Link>
            . Citations:{" "}
            <code className="rounded bg-white px-1 text-xs shadow-sm">prisma/data/TOWN_HALL_SEED_SOURCES.txt</code> and{" "}
            <Link href="/data-sources" className={primaryNavLinkClass}>
              Data sources
            </Link>
            .
          </p>

          {events.length === 0 ? (
            <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-sm text-[var(--muted-foreground)] shadow-sm">
              No constituency debate rows yet. Run migrations and seed (after constituencies load), or add rows in{" "}
              <strong className="text-[var(--foreground)]">Admin → Town halls &amp; forums</strong> with programme type{" "}
              <em>Constituency debate</em>.
            </p>
          ) : (
            <ul className="space-y-4">
              {events.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
                >
                  <p className="font-display text-lg font-semibold text-[var(--foreground)]">{ev.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {programmeEventKindLabel(ev.kind)}
                    {ev.constituency?.name ? ` · ${ev.constituency.name}` : ""}
                    {ev.programmeQuarter ? ` · ${ev.programmeQuarter}` : ""}
                    {" · "}
                    {ev.region?.name ?? "—"}
                    {" · "}
                    <span className="font-medium text-[var(--foreground)]">{statusLabel(ev.status)}</span>
                  </p>
                  {ev.summary ? <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{ev.summary}</p> : null}
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
