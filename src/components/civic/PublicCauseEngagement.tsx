"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = { id: string; body: string; createdAt: string; authorLabel: string };

type Props = {
  slug: string;
  initialSupportCount: number;
  initialViewerSupported: boolean;
  initialComments: Comment[];
  closed: boolean;
  signedIn: boolean;
};

export function PublicCauseEngagement({
  slug,
  initialSupportCount,
  initialViewerSupported,
  initialComments,
  closed,
  signedIn,
}: Props) {
  const [supportCount, setSupportCount] = useState(initialSupportCount);
  const [viewerSupported, setViewerSupported] = useState(initialViewerSupported);
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/public-causes/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      cause?: {
        supportCount?: number;
        viewerSupported?: boolean;
        comments?: Comment[];
        closed?: boolean;
      };
    };
    const c = data.cause;
    if (!c) return;
    if (typeof c.supportCount === "number") setSupportCount(c.supportCount);
    if (typeof c.viewerSupported === "boolean") setViewerSupported(c.viewerSupported);
    if (Array.isArray(c.comments)) setComments(c.comments);
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleSupport() {
    if (!signedIn || closed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/public-causes/${encodeURIComponent(slug)}/support`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: viewerSupported ? "remove" : "add" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        supportCount?: number;
        supported?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not update support.");
        return;
      }
      if (typeof data.supportCount === "number") setSupportCount(data.supportCount);
      if (typeof data.supported === "boolean") setViewerSupported(data.supported);
    } finally {
      setBusy(false);
    }
  }

  async function onComment(e: React.FormEvent) {
    e.preventDefault();
    if (!signedIn || closed || !body.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/public-causes/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; comment?: Comment };
      if (!res.ok) {
        setError(data.error ?? "Could not post comment.");
        return;
      }
      if (data.comment) {
        setComments((prev) => [...prev, data.comment!]);
        setBody("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Show support</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Members can signal shared concern. This is not a legal filing or vote.
        </p>
        <p className="mt-4 font-display text-3xl font-bold tabular-nums text-[var(--primary)]">{supportCount}</p>
        <p className="text-xs text-[var(--muted-foreground)]">members voiced support</p>
        {closed ? (
          <p className="mt-4 text-sm text-amber-800">This cause thread is closed for new support and comments.</p>
        ) : !signedIn ? (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            <a href={`/login?next=/citizens-voice/causes/${encodeURIComponent(slug)}`} className="font-medium text-[var(--primary)] hover:underline">
              Sign in
            </a>{" "}
            to support or comment.
          </p>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void toggleSupport()}
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {viewerSupported ? "Remove my support" : "I share this concern"}
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Discussion</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Stay factual and respectful. Moderators may hide posts that breach community standards.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
        ) : null}
        <ul className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <li className="text-sm text-[var(--muted-foreground)]">No comments yet.</li>
          ) : (
            comments.map((c) => (
              <li key={c.id} className="border-b border-[var(--border)] pb-4 last:border-0">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  {c.authorLabel} · {new Date(c.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]">{c.body}</p>
              </li>
            ))
          )}
        </ul>
        {signedIn && !closed ? (
          <form onSubmit={onComment} className="mt-6 space-y-3">
            <label htmlFor="cause-comment" className="block text-sm font-medium text-[var(--foreground)]">
              Add a comment
            </label>
            <textarea
              id="cause-comment"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              placeholder="Share context or constructive questions…"
            />
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]/15 disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
