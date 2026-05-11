"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { OnlinePresenceCard } from "@/components/member/OnlinePresenceCard";
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
    <div className="mt-6 space-y-4 border-t border-[var(--border)] pt-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        Connect in this region
      </h4>

      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      {!data && !err ? (
        <p className="text-sm text-[var(--muted-foreground)]">Loading regional activity…</p>
      ) : null}

      {data ? (
        <>
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
                className={`inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
              >
                Regional chatroom
              </Link>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">
                Regional chat opens when Communities are enabled for this site.
              </span>
            )}
            {data.reportCardVoiceHref ? (
              <Link
                href={data.reportCardVoiceHref}
                className={`inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-center text-sm font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--section-light)] ${focusRingSmClass}`}
              >
                People&apos;s Report Card — this region
              </Link>
            ) : (
              <span className="text-xs text-[var(--muted-foreground)]">Report Card filters appear when Voice or scores are live.</span>
            )}
            <Link href="/login" className={`inline-flex min-h-11 items-center text-sm font-semibold ${primaryLinkClass}`}>
              Sign in for regional presence →
            </Link>
            <Link href="/register" className={`inline-flex min-h-11 items-center text-sm font-semibold ${primaryLinkClass}`}>
              Create account →
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
