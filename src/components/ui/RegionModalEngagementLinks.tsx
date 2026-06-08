"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OnlinePresenceCard } from "@/components/member/OnlinePresenceCard";
import { communitiesBrowseHref } from "@/lib/communities-browse-shared";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";

type HubPayload = {
  hubCommunitySlug: string | null;
  regionalChatHref: string | null;
  reportCardVoiceHref: string | null;
  /** Present when the viewer may see aggregate counts (signed-in, or guests when enabled server-side). */
  onlineCount: number | null;
  onlineCountsVisible?: boolean;
  peerDetailsVisible: boolean;
  onlinePeers: { id: string; label: string }[];
  presenceNote: string;
};

export function RegionModalEngagementLinks({ regionSlug }: { regionSlug: string }) {
  const [data, setData] = useState<HubPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setErr(null);
    setData(null);
    (async () => {
      try {
        const res = await fetch(`/api/regions/${encodeURIComponent(regionSlug)}/hub`, { credentials: "include" });
        if (!res.ok) {
          if (!cancelled) setErr("Could not load regional links.");
          return;
        }
        const j = (await res.json()) as HubPayload;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setErr("Could not load regional links.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [regionSlug]);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Connect in this region</h3>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
        Regional chat, Report Card filters, and community spaces scoped to this region.
      </p>

      {err ? <p className="mt-4 text-sm text-red-600">{err}</p> : null}
      {!data && !err ? (
        <p className="mt-4 text-sm text-[var(--foreground-secondary)]">Loading regional activity…</p>
      ) : null}

      {data ? (
        <div className="mt-4 space-y-4">
          <OnlinePresenceCard
            data={{
              onlineCount: data.onlineCount,
              peerDetailsVisible: data.peerDetailsVisible,
              onlinePeers: data.onlinePeers,
              presenceNote: data.presenceNote,
            }}
            audienceLine={
              <>
                Signed-in members with this region as <strong>home region</strong>, active in the last few minutes.
              </>
            }
            signInToSeeCountLine="Sign in to see how many members are active in this region (last few minutes)."
            aggregateGuestNote="to see who else is online in this region (aggregate count is public)."
            emptyPeersLine="No other members visible right now — open the regional chat to start the conversation."
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {data.regionalChatHref ? (
              <Link
                href={data.regionalChatHref}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] sm:w-auto ${focusRingSmClass}`}
              >
                Regional chatroom
              </Link>
            ) : (
              <span className="text-xs text-[var(--foreground-secondary)]">
                Regional chat opens when Communities are enabled for this site.
              </span>
            )}
            {data.reportCardVoiceHref ? (
              <Link
                href={data.reportCardVoiceHref}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--section-light)] sm:w-auto ${focusRingSmClass}`}
              >
                People&apos;s Report Card — this region
              </Link>
            ) : (
              <span className="text-xs text-[var(--foreground-secondary)]">
                Report Card filters appear when Voice or scores are live.
              </span>
            )}
            <Link
              href={communitiesBrowseHref({ region: regionSlug })}
              className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--accent-gold)]/40 bg-[var(--accent-gold-light)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--accent-gold)] transition-colors hover:border-[var(--accent-gold)]/60 sm:w-auto ${focusRingSmClass}`}
            >
              Queen Mother &amp; traditional spaces
            </Link>
          </div>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--foreground-secondary)]">
            <Link href="/login" className={`font-semibold ${primaryLinkClass}`}>
              Sign in for regional presence
            </Link>
            <span className="text-[var(--foreground-secondary)]/50" aria-hidden>
              ·
            </span>
            <Link href="/register" className={`font-semibold ${primaryLinkClass}`}>
              Create account
            </Link>
          </p>
        </div>
      ) : null}
    </section>
  );
}
