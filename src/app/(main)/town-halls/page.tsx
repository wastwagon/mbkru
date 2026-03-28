import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isTownHallDirectoryPageEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Town halls & regional forums",
  description:
    "MBKRU town halls and regional listening forums — schedule and locations will be published as pilots roll out across Ghana.",
};

export default function TownHallsPage() {
  if (!isTownHallDirectoryPageEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Town halls & regional forums"
        description="Presidential and regional listening sessions in development. This page will list confirmed dates, venues, and registration when programmes open."
        breadcrumbCurrentLabel="Town halls"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <p>
            We are building a <strong className="text-[var(--foreground)]">directory</strong> of MBKRU-hosted and
            partner forums. Until events are confirmed, follow{" "}
            <Link href="/news" className="font-medium text-[var(--primary)] hover:underline">
              News &amp; Updates
            </Link>{" "}
            and the{" "}
            <Link href="/parliament-tracker" className="font-medium text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>{" "}
            for pilots.
          </p>
          <p>
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact us
            </Link>{" "}
            if your institution would like to co-host a regional session.
          </p>
        </div>
      </section>
    </div>
  );
}
