import Image from "next/image";

import { CommunityQueenMotherBadge } from "@/components/communities/CommunityQueenMotherBadge";

export type QueenMotherPublicProfile = {
  membershipId: string;
  displayName: string;
  portrait: { storagePath: string; alt: string | null } | null;
};

/** Public roster of verified Queen Mothers for a community detail page. */
export function CommunityQueenMotherRoster({ profiles }: { profiles: QueenMotherPublicProfile[] }) {
  if (profiles.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-[var(--accent-gold)]/30 bg-gradient-to-br from-[var(--accent-gold-light)] to-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Verified Queen Mothers</h2>
        <CommunityQueenMotherBadge count={profiles.length} />
      </div>
      <p className="mt-1 text-xs text-[var(--foreground-secondary)]">
        Platform-verified traditional roles in this civic space — not an official Traditional Council listing.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {profiles.map((p) => (
          <li
            key={p.membershipId}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white/90 px-3 py-3"
          >
            {p.portrait ? (
              <span className="relative inline-block h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--accent-gold)]/40 bg-[var(--section-light)]">
                <Image
                  src={p.portrait.storagePath}
                  alt={p.portrait.alt || `Portrait of ${p.displayName}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </span>
            ) : (
              <span
                className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)] text-sm font-bold text-[var(--accent-gold)]"
                aria-hidden
              >
                {p.displayName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("") || "QM"}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{p.displayName}</p>
              <p className="text-xs text-[var(--foreground-secondary)]">Verified Queen Mother</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Compact overlapping portrait stack for browse cards. */
export function QueenMotherPortraitStack({
  portraits,
  count,
}: {
  portraits: { storagePath: string; alt: string | null; name: string }[];
  count: number;
}) {
  if (count <= 0) return null;
  const shown = portraits.slice(0, 3);
  const extra = count - shown.length;

  return (
    <div className="flex items-center gap-2" aria-label={`${count} verified Queen Mother${count === 1 ? "" : "s"}`}>
      <div className="flex -space-x-2">
        {shown.map((p, i) => (
          <span
            key={`${p.storagePath}-${i}`}
            className="relative inline-block h-7 w-7 overflow-hidden rounded-full border-2 border-white bg-[var(--section-light)]"
          >
            <Image src={p.storagePath} alt={p.alt || p.name} fill className="object-cover" sizes="28px" />
          </span>
        ))}
        {shown.length === 0 ? (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--accent-gold-light)] text-[10px] font-bold text-[var(--accent-gold)]">
            QM
          </span>
        ) : null}
      </div>
      {extra > 0 ? (
        <span className="text-[11px] font-semibold text-[var(--accent-gold)]">+{extra}</span>
      ) : null}
    </div>
  );
}
