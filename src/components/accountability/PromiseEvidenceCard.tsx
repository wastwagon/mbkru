import type { ReactNode } from "react";

import { parseManifestoCatalogueRowNotes } from "@/lib/promise-catalogue-display";
import { policySectorLabel } from "@/lib/promise-policy-sectors";
import { focusRingSmClass, primaryNavLinkClass } from "@/lib/primary-link-styles";
import { primarySourceUrl } from "@/lib/promise-source";

function statusLabel(s: string): string {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function partyChipLabel(slug: string): string {
  return slug.trim().toUpperCase();
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

type ManifestoRef = { title: string; sourceUrl: string | null } | null;

type Props = {
  title: string;
  description: string | null;
  status: string;
  sourceLabel: string;
  sourceDate: Date | null;
  sourceUrl: string | null;
  verificationNotes: string | null;
  manifestoDocument: ManifestoRef;
  /** Optional row under title (e.g. responsible MP). */
  meta?: ReactNode;
  policySector?: string | null;
  manifestoPageRef?: string | null;
  electionCycle?: string | null;
  partySlug?: string | null;
  /** When set (e.g. from `GET /api/promises`), avoids re-deriving from `verificationNotes` on the client. */
  catalogueThemeLabel?: string | null;
  isManifestoCatalogueRow?: boolean;
};

export function PromiseEvidenceCard({
  title,
  description,
  status,
  sourceLabel,
  sourceDate,
  sourceUrl,
  verificationNotes,
  manifestoDocument,
  meta,
  policySector,
  manifestoPageRef,
  electionCycle,
  partySlug,
  catalogueThemeLabel: catalogueThemeLabelProp,
  isManifestoCatalogueRow: isManifestoCatalogueRowProp,
}: Props) {
  const href = primarySourceUrl({ sourceUrl, manifestoDocument });
  const manifestoOnlyHref = manifestoDocument?.sourceUrl?.trim() || null;
  const showSeparateManifestoLink = Boolean(
    manifestoOnlyHref && href && manifestoOnlyHref !== href && manifestoDocument,
  );
  const parsed = parseManifestoCatalogueRowNotes(verificationNotes);
  const themeLabel = catalogueThemeLabelProp ?? parsed.themeLabel;
  const isCatRow = isManifestoCatalogueRowProp ?? parsed.isCatalogueRow;
  const pageRef = manifestoPageRef?.trim() || null;
  const brief = description?.trim() || null;
  const showRefStrip =
    Boolean(partySlug?.trim() && electionCycle?.trim()) ||
    Boolean(themeLabel) ||
    Boolean(pageRef) ||
    Boolean(href) ||
    (isCatRow && !pageRef);

  return (
    <details className="group rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <summary
        className={`flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-sm p-5 ${focusRingSmClass} [&::-webkit-details-marker]:hidden`}
      >
        <div className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">{title}</h2>
            {policySector ? (
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-900">
                {policySectorLabel(policySector) ?? policySector}
              </span>
            ) : null}
          </div>
          {meta ? <div className="mt-2 text-sm text-[var(--muted-foreground)]">{meta}</div> : null}
          {brief ? (
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--muted-foreground)]">{brief}</p>
          ) : null}
          {showRefStrip ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
              {partySlug?.trim() && electionCycle?.trim() ? (
                <span className="rounded-md border border-[var(--border)] bg-[var(--section-light)] px-2 py-0.5 font-semibold uppercase tracking-wide text-[var(--foreground)]">
                  {partyChipLabel(partySlug)} · {electionCycle.trim()}
                </span>
              ) : null}
              {themeLabel ? (
                <span
                  className="rounded-md border border-[var(--border)] px-2 py-0.5 font-medium text-[var(--foreground)]"
                  title="Manifesto section grouping"
                >
                  {themeLabel}
                </span>
              ) : null}
              {pageRef ? (
                <span
                  className="rounded-md border border-dotted border-[var(--border)] px-2 py-0.5 text-[var(--foreground)]"
                  title="Locator in the cited source"
                >
                  Ref · {pageRef}
                </span>
              ) : isCatRow ? (
                <span className="rounded-md border border-dashed border-[var(--border)] px-2 py-0.5 italic text-[var(--foreground)]">
                  Page ref pending
                </span>
              ) : null}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${primaryNavLinkClass} inline-flex items-center gap-1 font-semibold`}
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                  Official PDF
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
            {statusLabel(status)}
          </span>
          <span
            className="text-[var(--muted-foreground)] transition-transform group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </div>
      </summary>
      <div className="space-y-4 border-t border-[var(--border)] px-5 pb-5 pt-4">
        {description?.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted-foreground)]">{description.trim()}</p>
        ) : null}

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--foreground)]">
            Verification and impact
          </p>
          {isCatRow ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Sourced from the party&apos;s published manifesto text. MBKRU treats this as a tracking unit; confirm exact
                wording against the PDF and add a page reference when editors sign off.
              </p>
              {parsed.editorVerification ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                  {parsed.editorVerification}
                </p>
              ) : null}
            </>
          ) : verificationNotes?.trim() ? (
            <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">{verificationNotes.trim()}</p>
          ) : (
            <p className="mt-2 text-sm italic text-[var(--muted-foreground)]">
              Verification details are pending for this commitment. Use the source line and manifesto link on the card
              for the original record.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--primary)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5"
            >
              <ExternalLinkIcon className="shrink-0 opacity-80" />
              Source: {sourceLabel.length > 48 ? `${sourceLabel.slice(0, 45)}…` : sourceLabel}
            </a>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">Source (text):</span> {sourceLabel}
            </p>
          )}
          {showSeparateManifestoLink && manifestoDocument && manifestoOnlyHref ? (
            <a
              href={manifestoOnlyHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`${primaryNavLinkClass} justify-center gap-2 text-sm`}
            >
              <ExternalLinkIcon className="shrink-0" />
              Manifesto: {manifestoDocument.title}
            </a>
          ) : null}
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          {sourceDate
            ? `Cited: ${sourceDate.toLocaleDateString("en-GB", { dateStyle: "medium" })}`
            : "Citation date not set"}
        </p>
      </div>
    </details>
  );
}
