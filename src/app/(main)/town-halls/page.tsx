import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { isTownHallDirectoryPageEnabled } from "@/lib/reports/accountability-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Town halls & regional forums",
  description:
    "MBKRU town halls and regional listening forums — confirmed dates and venues are announced when programmes open.",
};

export default function TownHallsPage() {
  if (!isTownHallDirectoryPageEnabled()) notFound();

  return (
    <div>
      <PageHeader
        title="Town halls & regional forums"
        description="Presidential and regional listening sessions. Dates, venues, and registration are published only once partners confirm them."
        breadcrumbCurrentLabel="Forums"
      />
      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          <p>
            We maintain a <strong className="text-[var(--foreground)]">directory</strong> of MBKRU-hosted and partner forums.{" "}
            <strong className="text-[var(--foreground)]">No schedule is listed here until it is confirmed</strong> — check{" "}
            <Link href="/news" className="font-medium text-[var(--primary)] hover:underline">
              News &amp; Updates
            </Link>{" "}
            for dated announcements, and the{" "}
            <Link href="/parliament-tracker" className="font-medium text-[var(--primary)] hover:underline">
              Accountability hub
            </Link>{" "}
            for related pilots.
          </p>
          <p>
            <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
              Contact us
            </Link>{" "}
            if your institution would like to co-host a regional session.
          </p>
          <p className="text-sm">
            <Link href="/data-sources" className="font-medium text-[var(--primary)] hover:underline">
              Data sources
            </Link>{" "}
            explains where published datasets on this site come from.
          </p>
        </div>
      </section>
    </div>
  );
}
