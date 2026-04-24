import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PetitionCreateForm } from "@/components/civic/PetitionCreateForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { getServerPlatformPhase, platformFeatures } from "@/config/platform";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { getMemberSession } from "@/lib/member/session";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { isCivicPetitionsAndPublicCausesEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a petition",
  description: "Publish a new petition on MBKRU (sign-in required).",
};

export default async function NewPetitionPage() {
  if (!isCivicPetitionsAndPublicCausesEnabled() || !isDatabaseConfigured()) notFound();

  const phase = getServerPlatformPhase();
  if (!platformFeatures.authentication(phase)) notFound();

  const session = await getMemberSession();
  if (!session) {
    return (
      <div>
        <PageHeader
          title="Start a petition"
          description="Sign in to create a petition. Guests can still sign petitions with email verification where Turnstile is enabled."
        />
        <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
          <div className="mx-auto max-w-md px-4 text-center sm:px-6 lg:px-8">
            <Link
              href="/login?next=/petitions/new"
              className={`inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 sm:w-auto ${focusRingSmClass}`}
            >
              Sign in to continue
            </Link>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              <Link href="/petitions" className={`${primaryNavLinkClass} justify-center`}>
                ← Browse petitions
              </Link>
            </p>
          </div>
        </section>
      </div>
    );
  }

  const regions = await prisma.region.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Start a petition"
        description="Write clearly, cite what you know, and avoid personal attacks. MBKRU moderators may archive petitions that breach policy."
        breadcrumbCurrentLabel="New"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link
              href="/petitions"
              className={primaryNavLinkClass}
            >
              ← All petitions
            </Link>
          </p>
          <PetitionCreateForm regions={regions} />
        </div>
      </section>
    </div>
  );
}
