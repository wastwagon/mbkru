"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { primaryLinkClass } from "@/lib/primary-link-styles";

export type OnlinePresenceData = {
  onlineCount: number | null;
  peerDetailsVisible: boolean;
  onlinePeers: { id: string; label: string }[];
  presenceNote: string;
};

type Props = {
  data: OnlinePresenceData;
  audienceLine: ReactNode;
  signInToSeeCountLine: string;
  aggregateGuestNote?: string;
  emptyPeersLine: string;
};

/**
 * Shared “who’s online” surface for regions and communities (same privacy rules from API).
 */
export function OnlinePresenceCard({
  data,
  audienceLine,
  signInToSeeCountLine,
  aggregateGuestNote,
  emptyPeersLine,
}: Props) {
  const { onlineCount, peerDetailsVisible, onlinePeers, presenceNote } = data;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Who&apos;s online</p>
      {onlineCount !== null ? (
        <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--primary)]">{onlineCount}</p>
      ) : (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{signInToSeeCountLine}</p>
      )}
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{audienceLine}</p>
      {!peerDetailsVisible && onlineCount !== null && onlineCount > 0 && aggregateGuestNote ? (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          <Link href="/login" className={`font-semibold ${primaryLinkClass}`}>
            Sign in
          </Link>{" "}
          {aggregateGuestNote}
        </p>
      ) : null}
      {peerDetailsVisible && onlinePeers.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {onlinePeers.map((p) => (
            <li
              key={p.id}
              className="rounded-full border border-[var(--border)] bg-[var(--section-light)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
            >
              {p.label}
            </li>
          ))}
        </ul>
      ) : null}
      {peerDetailsVisible && onlinePeers.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">{emptyPeersLine}</p>
      ) : null}
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{presenceNote}</p>
    </div>
  );
}
