import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
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
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {verifyMsg ? (
            <p
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
              role="alert"
            >
              {verifyMsg}
            </p>
          ) : null}
          <p className="flex flex-wrap gap-3 text-sm">
            <Link href="/petitions/new" className="font-medium text-[var(--primary)] hover:underline">
              Start a petition
            </Link>
            <span className="text-[var(--muted-foreground)]">·</span>
            <Link href="/citizens-voice/causes" className="font-medium text-[var(--primary)] hover:underline">
              Public causes (Voice threads)
            </Link>
          </p>

          {petitions.length === 0 ? (
            <p className="mt-10 text-center text-sm text-[var(--muted-foreground)]">
              No open petitions yet. Be the first to start one.
            </p>
          ) : (
            <ul className="mt-10 space-y-4">
              {petitions.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/petitions/${encodeURIComponent(p.slug)}`}
                    className="block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--primary)]/30"
                  >
                    <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{p.title}</h2>
                    {p.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-foreground)]">{p.summary}</p>
                    ) : null}
                    <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                      {p._count.signatures.toLocaleString()} signature{p._count.signatures === 1 ? "" : "s"}
                      {p.region?.name ? ` · ${p.region.name}` : ""}
                    </p>
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
