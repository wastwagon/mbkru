import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

export const metadata: Metadata = {
  title: "Data sources",
  description:
    "Where MBKRU bundled accountability and community data comes from, and how to verify it against official sources.",
};

/** Collapsible block so routine visitors see sources first; file paths stay available for maintainers. */
function MaintainerDetails({ children }: { children: ReactNode }) {
  return (
    <details className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--section-light)]/70 px-3 py-2 text-[13px] text-[var(--foreground)]">
      <summary
        className={`cursor-pointer rounded-sm font-medium text-[var(--foreground)] ${focusRingSmClass}`}
      >
        File paths &amp; refresh commands (maintainers)
      </summary>
      <div className="mt-2 space-y-2 leading-relaxed text-[var(--muted-foreground)]">{children}</div>
    </details>
  );
}

const sources: { heading: string; body: ReactNode }[] = [
  {
    heading: "Parliamentary constituencies",
    body: (
      <>
        <p>
          Constituency names and structure are cross-checked against the English Wikipedia list{" "}
          <a
            href="https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana"
            className={primaryLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            List of parliamentary constituencies of Ghana
          </a>{" "}
          (licensed under{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            className={primaryLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-SA 4.0
          </a>
          ). Wikipedia is a convenience for bulk structure; the{" "}
          <a href="https://ec.gov.gh/" className={primaryLinkClass} target="_blank" rel="noopener noreferrer">
            Electoral Commission of Ghana
          </a>{" "}
          is the authority for boundaries and seat changes.
        </p>
        <MaintainerDetails>
          <p>
            Bundled seed file:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              prisma/data/constituencies.seed.json
            </code>
          </p>
          <p>
            Regenerate from Wikipedia:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              npm run data:refresh-constituencies-seed
            </code>
          </p>
        </MaintainerDetails>
      </>
    ),
  },
  {
    heading: "Members of Parliament roster",
    body: (
      <>
        <p>
          The starting roster is built from the English Wikipedia page{" "}
          <a
            href="https://en.wikipedia.org/wiki/List_of_MPs_elected_in_the_2024_Ghanaian_general_election"
            className={primaryLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            List of MPs elected in the 2024 Ghanaian general election
          </a>{" "}
          (CC BY-SA 4.0). Labels are matched to constituency names where possible; unmatched rows may appear without a
          constituency link. For who currently sits in Parliament, cross-check{" "}
          <a href="https://www.parliament.gh/members" className={primaryLinkClass} target="_blank" rel="noopener noreferrer">
            parliament.gh — members
          </a>
          .
        </p>
        <MaintainerDetails>
          <p>
            Bundled seed file:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              prisma/data/parliament-members.seed.json
            </code>
          </p>
          <p>
            Regenerate:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              npm run data:refresh-members-seed-wikipedia
            </code>
          </p>
          <p>
            Source notes:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              prisma/data/PARLIAMENT_MEMBERS_SEED_SOURCE.txt
            </code>
          </p>
        </MaintainerDetails>
      </>
    ),
  },
  {
    heading: "Town halls & regional forums",
    body: (
      <>
        <p>
          The public{" "}
          <Link href="/town-halls" className={primaryLinkClass}>
            Town halls &amp; forums
          </Link>{" "}
          page lists events once they are confirmed for publication.
          Constituency debates are listed on{" "}
          <Link href="/debates" className={primaryLinkClass}>
            Constituency debates
          </Link>
          . There is no separate national “open API” for these programme-specific rows — operational truth is also reflected
          in News posts and partner communications.
        </p>
        <MaintainerDetails>
          <p>
            Rows map to <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">TownHallEvent</code> in the
            application database. Starter programme rows may ship with bundled data unless{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">SEED_TOWN_HALL_PROGRAMME=0</code>.
          </p>
          <p>
            Citation notes in source:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">prisma/data/TOWN_HALL_SEED_SOURCES.txt</code>
          </p>
        </MaintainerDetails>
      </>
    ),
  },
  {
    heading: "Traditional-area community spaces",
    body: (
      <>
        <p>
          Starter descriptions for named traditional areas cite public materials — for example the Ajumako Traditional
          Council&apos;s{" "}
          <a
            href="https://efuajumakotcouncil.com/?page=queens"
            className={primaryLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            Queen Mothers
          </a>{" "}
          page, and public reporting such as{" "}
          <a href="https://uenr.edu.gh/" className={primaryLinkClass} target="_blank" rel="noopener noreferrer">
            UENR
          </a>{" "}
          news on Sunyani Traditional Council. MBKRU does not claim to represent those councils.
        </p>
        <MaintainerDetails>
          <p>
            Bundled seed:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              prisma/data/communities.seed.json
            </code>
          </p>
        </MaintainerDetails>
      </>
    ),
  },
  {
    heading: "Party manifestos & accountability starter",
    body: (
      <>
        <p>
          Sample manifesto metadata and promise themes point to party-published PDFs (see admin and the{" "}
          <Link href="/methodology" className={primaryLinkClass}>
            methodology
          </Link>{" "}
          page). Editors remain responsible for accurate citations and rights.
        </p>
        <MaintainerDetails>
          <p>
            Extended import and column notes for operators:{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
              docs/DATA_SOURCES.md
            </code>{" "}
            in the website source repository.
          </p>
        </MaintainerDetails>
      </>
    ),
  },
];

export default function DataSourcesPage() {
  return (
    <div>
      <PageHeader
        title="Data sources"
        description="MBKRU publishes non-partisan tools. Below is where bundled datasets come from and how to verify them."
        breadcrumbCurrentLabel="Data sources"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-10 px-4 text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <p className="leading-relaxed">
            This page lists <strong className="text-[var(--foreground)]">citable public sources</strong> so journalists,
            partners, and citizens can check what we publish. Where the site ships starter packaged data, MBKRU is still
            responsible for editorial accuracy — always confirm against official institutions before legal or high-stakes
            communications.
          </p>
          <ul className="space-y-8">
            {sources.map((s) => (
              <li key={s.heading} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{s.heading}</h2>
                <div className="mt-3 space-y-3 leading-relaxed">{s.body}</div>
              </li>
            ))}
          </ul>
          <details className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
            <summary
              className={`cursor-pointer rounded-sm font-semibold text-[var(--foreground)] ${focusRingSmClass}`}
            >
              Full technical runbook (repository)
            </summary>
            <p className="mt-3 text-[var(--muted-foreground)]">
              Imports, CSV columns, and optional tooling for developers are documented in{" "}
              <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px] text-[var(--foreground)]">
                docs/DATA_SOURCES.md
              </code>{" "}
              in the MBKRU website source tree.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
