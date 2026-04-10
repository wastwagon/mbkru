import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Data sources",
  description:
    "Where MBKRU bundled accountability and community data comes from, and how to verify it against official sources.",
};

const sources: { heading: string; body: ReactNode }[] = [
  {
    heading: "Parliamentary constituencies (bundled JSON)",
    body: (
      <>
        The file <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">prisma/data/constituencies.seed.json</code> is
        produced from the English Wikipedia page{" "}
        <a
          href="https://en.wikipedia.org/wiki/List_of_parliamentary_constituencies_of_Ghana"
          className="font-medium text-[var(--primary)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          List of parliamentary constituencies of Ghana
        </a>{" "}
        (licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          className="text-[var(--primary)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 4.0
        </a>
        ). Wikipedia is a convenience for bulk structure; the{" "}
        <a
          href="https://ec.gov.gh/"
          className="text-[var(--primary)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Electoral Commission of Ghana
        </a>{" "}
        is the authority for boundaries and seat changes. Regenerate:{" "}
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">npm run data:refresh-constituencies-seed</code>.
      </>
    ),
  },
  {
    heading: "Members of Parliament roster (bundled JSON)",
    body: (
      <>
        The file{" "}
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">prisma/data/parliament-members.seed.json</code> is built from
        the English Wikipedia page{" "}
        <a
          href="https://en.wikipedia.org/wiki/List_of_MPs_elected_in_the_2024_Ghanaian_general_election"
          className="font-medium text-[var(--primary)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          List of MPs elected in the 2024 Ghanaian general election
        </a>{" "}
        (CC BY-SA 4.0). Constituency labels are matched to our constituency slugs where possible; unmatched rows may load without a constituency
        link. For who currently sits in Parliament, cross-check{" "}
        <a href="https://www.parliament.gh/members" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">
          parliament.gh — members
        </a>
        . Regenerate:{" "}
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">npm run data:refresh-members-seed-wikipedia</code>. See also{" "}
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">prisma/data/PARLIAMENT_MEMBERS_SEED_SOURCE.txt</code>.
      </>
    ),
  },
  {
    heading: "Traditional-area community spaces (bundled JSON)",
    body: (
      <>
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">prisma/data/communities.seed.json</code> describes civic spaces
        tied to named traditional areas. Descriptions cite public materials: the Ajumako Traditional Council&apos;s{" "}
        <a
          href="https://efuajumakotcouncil.com/?page=queens"
          className="text-[var(--primary)] underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Queen Mothers
        </a>{" "}
        page, and public reporting such as{" "}
        <a href="https://uenr.edu.gh/" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">
          UENR
        </a>{" "}
        news on Sunyani Traditional Council. MBKRU does not claim to represent those councils.
      </>
    ),
  },
  {
    heading: "Party manifestos & accountability starter",
    body: (
      <>
        Sample manifesto metadata and promise themes in seed point to party-published PDFs (see admin and the{" "}
        <Link href="/methodology" className="text-[var(--primary)] underline">
          methodology
        </Link>{" "}
        page). Editors are responsible for accurate citations and rights. Operators should read{" "}
        <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">docs/DATA_SOURCES.md</code> in the git repository.
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
          <p>
            This page summarises <strong className="text-[var(--foreground)]">citable sources</strong> for data loaded by{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-[13px] text-[var(--foreground)]">prisma db seed</code>. MBKRU remains responsible
            for editorial accuracy; always confirm against official institutions before communications or legal use.
          </p>
          <ul className="space-y-8">
            {sources.map((s) => (
              <li key={s.heading} className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
                <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{s.heading}</h2>
                <div className="mt-3 leading-relaxed">{s.body}</div>
              </li>
            ))}
          </ul>
          <p className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
            <strong className="text-[var(--foreground)]">Technical reference:</strong> the full runbook for imports, CSV columns, and optional
            tooling lives in the project repository at{" "}
            <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-[13px]">docs/DATA_SOURCES.md</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
