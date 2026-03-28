import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Accountability methodology",
  description:
    "How MBKRU approaches promise tracking and score-style accountability — independent, transparent, and adapted for Ghana.",
};

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        title="Accountability methodology"
        description="MBKRU combines public data, documented commitments, and careful editorial judgement. We do not replace official regulators or electoral bodies."
      />

      <section className="section-spacing section-full bg-white">
        <div className="mx-auto max-w-3xl px-4 text-[var(--foreground)] sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold">Principles</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-[var(--muted-foreground)]">
            <li>
              <strong className="text-[var(--foreground)]">Evidence-led:</strong> claims about promises or performance
              cite sources (manifestos, Hansard-style records, budgets, or on-the-record statements).
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Non-partisan process:</strong> teams document facts and
              status changes; political commentary is separate from the dataset.
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Corrections:</strong> when we get something wrong, we fix
              the record and note material updates where practical.
            </li>
          </ul>

          <h2 className="mt-12 font-display text-xl font-bold">Promise tracking</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Campaign promises are logged with a title, optional narrative, and a source label (e.g. manifesto section
            or speech). Status moves through tracking, in progress, fulfilled, broken, or deferred — always tied back to
            evidence or a transparent rationale for deferral.
          </p>

          <h2 className="mt-12 font-display text-xl font-bold">Score-style views (People&apos;s Report Card)</h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Future scorecards will summarise multiple dimensions (e.g. accessibility, follow-through on commitments,
            use of public resources) using published methodologies. Dimensions are inspired by international
            transparency and parliamentary openness frameworks, then adapted to Ghanaian institutions and data
            availability — not copied wholesale.
          </p>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Scores are explanatory, not legal findings. They complement — and never substitute for — official
            oversight by bodies such as CHRAJ, the Auditor-General, or the Electoral Commission.
          </p>

          <p className="mt-12 text-sm text-[var(--muted-foreground)]">
            Technical access: when enabled for your deployment,{" "}
            <code className="rounded bg-[var(--section-light)] px-1.5 py-0.5 text-xs">
              GET /api/promises?memberSlug=…
            </code>{" "}
            returns public JSON for integrated displays.
          </p>

          <p className="mt-6">
            <Link href="/parliament-tracker" className="text-sm font-medium text-[var(--primary)] hover:underline">
              ← Accountability &amp; Electoral Watch
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
