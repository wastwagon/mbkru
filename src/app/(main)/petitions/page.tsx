import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { AccountabilityDisclaimerCallout } from "@/components/legal/AccountabilityDisclaimerCallout";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Petitions",
  description: "Start or sign citizen petitions on MBKRU — build visibility for shared concerns.",
};

const VERIFY_MESSAGES: Record<string, string> = {
  invalid: "That confirmation link is invalid or was already used. Try signing the petition again.",
  expired: "This confirmation link has expired. Open the petition and sign again to receive a new email.",
  closed: "This petition is no longer open for signatures, so your confirmation could not be completed.",
  unavailable: "Signatures could not be confirmed right now. Try again later.",
};

type IndexProps = { searchParams?: Promise<{ verify?: string }> };

export default async function PetitionsIndexPage({ searchParams }: IndexProps) {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const sp = (await searchParams) ?? {};
  const verifyMsg = sp.verify
    ? (VERIFY_MESSAGES[sp.verify] ?? "Something went wrong with signature confirmation.")
    : null;

  const petitions = await prisma.petition.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      region: { select: { name: true } },
      _count: { select: { signatures: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Petitions"
        description="Create a petition when you want to show breadth of concern on an issue. Signing uses your email once to prevent duplicates; optional updates are petition-specific."
        breadcrumbCurrentLabel="Petitions"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {verifyMsg ? (
            <p
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="alert"
            >
              {verifyMsg}
            </p>
          ) : null}
          <AccountabilityDisclaimerCallout variant="civicParticipation" className="mb-6" />
          <p className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">
            Citizen signature campaigns — separate from MBKRU Voice reports and public cause threads.{" "}
            <Link href="/citizens-voice/causes" className={primaryNavLinkClass}>
              Public causes
            </Link>
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-[var(--foreground-secondary)]">
            <Link href="/petitions/new" className={primaryNavLinkClass}>
              Start a petition
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/citizens-voice" className={primaryNavLinkClass}>
              MBKRU Voice
            </Link>
          </p>

          {petitions.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--foreground-secondary)]">
              No open petitions yet. Be the first to start one.
            </p>
          ) : (
            <ul className="mt-8 space-y-3">
              {petitions.map((p) => {
                const href = `/petitions/${encodeURIComponent(p.slug)}`;
                const metaParts = [
                  `${p._count.signatures.toLocaleString()} signature${p._count.signatures === 1 ? "" : "s"}`,
                  p.region?.name,
                ].filter(Boolean);

                return (
                  <li key={p.id}>
                    <article className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:border-[var(--primary)]/35 sm:p-5">
                      <h2 className="text-base font-semibold leading-snug text-[var(--foreground)] sm:text-lg">
                        <Link href={href} className="hover:text-[var(--primary)]">
                          {p.title}
                        </Link>
                      </h2>
                      {p.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--foreground-secondary)]">
                          {p.summary}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <Link
                          href={href}
                          className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
                        >
                          View petition
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
