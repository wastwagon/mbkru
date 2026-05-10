"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
          <div className="rounded-lg border border-[var(--border)] bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Who&apos;s online
            </p>
            {data.onlineCount !== null ? (
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--primary)]">{data.onlineCount}</p>
            ) : (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Sign in to see how many members are active in this region (last few minutes).
              </p>
            )}
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Signed-in members with this region as <strong>home region</strong>, active in the last few minutes.
            </p>
            {!data.peerDetailsVisible && data.onlineCount !== null && data.onlineCount > 0 ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                <Link href="/login" className={`font-semibold ${primaryLinkClass}`}>
                  Sign in
                </Link>{" "}
                to see who else is online in this region (aggregate count is public).
              </p>
            ) : null}
            {data.peerDetailsVisible && data.onlinePeers.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {data.onlinePeers.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-full border border-[var(--border)] bg-[var(--section-light)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                  >
                    {p.label}
                  </li>
                ))}
              </ul>
            ) : null}
            {data.peerDetailsVisible && data.onlinePeers.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                No other members visible right now — open the regional chat to start the conversation.
              </p>
            ) : null}
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{data.presenceNote}</p>
          </div>

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
