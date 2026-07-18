import Link from "next/link";
import Image from "next/image";
import type { ProgrammeEventKind } from "@prisma/client";

import { TopicPictogram } from "@/components/civic/TopicPictogram";
import { programmeEventKindLabel } from "@/lib/programme-event-labels";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";

export type ProgrammeEventCardProps = {
  title: string;
  kind: ProgrammeEventKind;
  status: string;
  summary: string | null;
  programmeQuarter: string | null;
  startsAt: Date | null;
  endsAt: Date | null;
  venueLine: string | null;
  infoUrl: string | null;
  sourceCitation: string | null;
  regionName: string | null;
  constituencyName: string | null;
  featuredImage?: { storagePath: string; alt: string | null } | null;
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

function statusBadgeClass(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary-dark)]";
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900";
    case "TBC":
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-950";
  }
}

export function ProgrammeEventCard({
  title,
  kind,
  status,
  summary,
  programmeQuarter,
  startsAt,
  endsAt,
  venueLine,
  infoUrl,
  sourceCitation,
  regionName,
  constituencyName,
  featuredImage = null,
}: ProgrammeEventCardProps) {
  const metaParts = [
    programmeEventKindLabel(kind),
    constituencyName,
    programmeQuarter,
    regionName ?? "National / multi-region",
  ].filter(Boolean);

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      {featuredImage ? (
        <div className="relative mb-4 aspect-[21/9] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--section-light)]">
          <Image
            src={featuredImage.storagePath}
            alt={featuredImage.alt || title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        <TopicPictogram variant={kind} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="font-display text-lg font-semibold text-[var(--foreground)]">{title}</p>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(status)}`}
            >
              {statusLabel(status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--foreground-secondary)]">{metaParts.join(" · ")}</p>
        </div>
      </div>
      {summary ? <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-secondary)]">{summary}</p> : null}
      {startsAt ? (
        <p className="mt-3 text-xs text-[var(--foreground-secondary)]">
          Window: {new Date(startsAt).toLocaleString("en-GB")}
          {endsAt ? ` – ${new Date(endsAt).toLocaleString("en-GB")}` : null}
        </p>
      ) : null}
      {venueLine ? (
        <p className="mt-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">Venue: </span>
          {venueLine}
        </p>
      ) : null}
      {infoUrl ? (
        <p className="mt-2 text-sm">
          <a href={infoUrl} className={primaryNavLinkClass} rel="noopener noreferrer">
            More information
          </a>
        </p>
      ) : null}
      {sourceCitation ? (
        <p className="mt-4 border-t border-[var(--border)] pt-3 text-[11px] leading-relaxed text-[var(--foreground-secondary)]">
          <span className="font-semibold text-[var(--foreground)]">Reference: </span>
          {sourceCitation}
        </p>
      ) : null}
    </article>
  );
}

export function ProgrammeEventsEmptyState({
  message,
  newsHref = "/news",
}: {
  message: string;
  newsHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center shadow-sm">
      <TopicPictogram variant="TOWN_HALL" className="mx-auto h-12 w-12" />
      <p className="mt-4 text-sm text-[var(--foreground-secondary)]">{message}</p>
      <p className="mt-3 text-sm">
        <Link href={newsHref} className={primaryNavLinkClass}>
          Check News for confirmed dates
        </Link>
      </p>
    </div>
  );
}
