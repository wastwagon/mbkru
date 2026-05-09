"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { redirectToMemberLogin } from "@/lib/client/member-login-redirect";
import { primaryLinkClass } from "@/lib/primary-link-styles";
import type { VoiceDiscussionPayload } from "@/lib/voice-discussion-types";

type CommentRow = VoiceDiscussionPayload["comments"][number];

type Props = {
  initial: VoiceDiscussionPayload;
  reportId: string;
};

export function VoiceDiscussionPanel({ initial, reportId }: Props) {
  const router = useRouter();
  const basePath = `/citizens-voice/discussions/${encodeURIComponent(reportId)}`;

  const [data, setData] = useState<VoiceDiscussionPayload>(initial);
  const [supportBusy, setSupportBusy] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [replyParentId, setReplyParentId] = useState<string | null>(null);

  const roots = useMemo(
    () => data.comments.filter((c) => c.parentCommentId === null),
    [data.comments],
  );

  function repliesOf(parentId: string): CommentRow[] {
    return data.comments.filter((c) => c.parentCommentId === parentId);
  }

  async function toggleSupport() {
    setSupportBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/voice-discussions/${encodeURIComponent(reportId)}/support`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: data.viewerSupported ? "remove" : "add" }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        supportCount?: number;
        supported?: boolean;
      };
      if (!res.ok) {
        if (res.status === 401) {
          redirectToMemberLogin(router, basePath);
          return;
        }
        setError(json.error ?? "Could not update support.");
        return;
      }
      setData((prev) => ({
        ...prev,
        supportCount: typeof json.supportCount === "number" ? json.supportCount : prev.supportCount,
        viewerSupported: Boolean(json.supported),
      }));
    } finally {
      setSupportBusy(false);
    }
  }

  async function postComment(e: React.FormEvent, parentId: string | null) {
    e.preventDefault();
    if (!body.trim()) return;
    setCommentBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/voice-discussions/${encodeURIComponent(reportId)}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          parentCommentId: parentId,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        comment?: CommentRow;
      };
      if (!res.ok) {
        if (res.status === 401) {
          redirectToMemberLogin(router, basePath);
          return;
        }
        setError(json.error ?? "Could not post comment.");
        return;
      }
      if (json.comment) {
        setData((prev) => ({
          ...prev,
          comments: [...prev.comments, json.comment!],
        }));
        setBody("");
        setReplyParentId(null);
      }
    } finally {
      setCommentBusy(false);
    }
  }

  async function setReaction(commentId: string, kind: "LIKE" | "THANK" | "INSIGHT" | null) {
    setError(null);
    try {
      const res = await fetch(
        `/api/voice-discussions/${encodeURIComponent(reportId)}/comments/${encodeURIComponent(commentId)}/reaction`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        viewerReaction?: "LIKE" | "THANK" | "INSIGHT" | null;
        reactions?: { LIKE: number; THANK: number; INSIGHT: number };
      };
      if (!res.ok) {
        if (res.status === 401) {
          redirectToMemberLogin(router, basePath);
          return;
        }
        setError(json.error ?? "Could not save reaction.");
        return;
      }
      setData((prev) => ({
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                reactions: json.reactions ?? c.reactions,
                viewerReaction:
                  json.viewerReaction === undefined ? c.viewerReaction : (json.viewerReaction ?? null),
              }
            : c,
        ),
      }));
    } catch {
      setError("Could not save reaction.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Report</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">{data.body}</p>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          Submitted {new Date(data.createdAt).toLocaleString("en-GB")}
          {data.regionName ? ` · ${data.regionName}` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Support</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Members can signal shared concern — not a vote or legal filing.
        </p>
        <p className="mt-4 font-display text-3xl font-bold tabular-nums text-[var(--primary)]">{data.supportCount}</p>
        <p className="text-xs text-[var(--muted-foreground)]">members voiced support</p>
        {data.sessionSignedIn ? (
          <button
            type="button"
            disabled={supportBusy}
            onClick={() => void toggleSupport()}
            className="mt-4 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {data.viewerSupported ? "Remove my support" : "I share this concern"}
          </button>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            <a href={`/login?next=${encodeURIComponent(basePath)}`} className={primaryLinkClass}>
              Sign in
            </a>{" "}
            to show support.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Discussion</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Stay factual and respectful. You are accountable for what you post.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
        ) : null}

        <ul className="mt-6 space-y-6">
          {roots.length === 0 ? (
            <li className="text-sm text-[var(--muted-foreground)]">No comments yet.</li>
          ) : (
            roots.map((c) => (
              <li key={c.id} className="border-b border-[var(--border)] pb-6 last:border-0">
                <CommentBlock
                  comment={c}
                  canEngage={data.sessionSignedIn}
                  discussionLoginHref={`/login?next=${encodeURIComponent(basePath)}`}
                  onReact={setReaction}
                  onReply={() => {
                    setReplyParentId(c.id);
                    setBody("");
                  }}
                />
                {repliesOf(c.id).map((r: CommentRow) => (
                  <div key={r.id} className="ml-6 mt-4 border-l-2 border-[var(--border)] pl-4">
                    <CommentBlock
                      comment={r}
                      canEngage={data.sessionSignedIn}
                      discussionLoginHref={`/login?next=${encodeURIComponent(basePath)}`}
                      onReact={setReaction}
                      onReply={() => {}}
                      small
                    />
                  </div>
                ))}
              </li>
            ))
          )}
        </ul>

        {data.sessionSignedIn ? (
          <form onSubmit={(e) => postComment(e, replyParentId)} className="mt-8 space-y-3">
            {replyParentId ? (
              <p className="text-xs text-[var(--muted-foreground)]">
                Replying to thread ·{" "}
                <button type="button" className={primaryLinkClass} onClick={() => setReplyParentId(null)}>
                  Cancel
                </button>
              </p>
            ) : null}
            <label htmlFor="vd-comment" className="block text-sm font-medium text-[var(--foreground)]">
              Add a comment
            </label>
            <textarea
              id="vd-comment"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
              placeholder="Share context or ask a constructive question…"
            />
            <button
              type="submit"
              disabled={commentBusy || !body.trim()}
              className="rounded-xl border border-[var(--border)] bg-[var(--section-light)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]/15 disabled:opacity-50"
            >
              {commentBusy ? "Posting…" : replyParentId ? "Post reply" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            <a href={`/login?next=${encodeURIComponent(basePath)}`} className={primaryLinkClass}>
              Sign in
            </a>{" "}
            to comment or react.
          </p>
        )}
      </div>
    </div>
  );
}

function CommentBlock({
  comment,
  canEngage,
  discussionLoginHref,
  onReact,
  onReply,
  small,
}: {
  comment: CommentRow;
  canEngage: boolean;
  discussionLoginHref: string;
  onReact: (id: string, kind: "LIKE" | "THANK" | "INSIGHT" | null) => void;
  onReply: () => void;
  small?: boolean;
}) {
  const labels: Record<"LIKE" | "THANK" | "INSIGHT", string> = {
    LIKE: "Like",
    THANK: "Thanks",
    INSIGHT: "Important",
  };

  return (
    <div>
      <p className={`${small ? "text-[11px]" : "text-xs"} font-medium text-[var(--muted-foreground)]`}>
        {comment.authorLabel} · {new Date(comment.createdAt).toLocaleString()}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]">{comment.body}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["LIKE", "THANK", "INSIGHT"] as const).map((k) =>
          canEngage ? (
            <button
              key={k}
              type="button"
              onClick={() => onReact(comment.id, comment.viewerReaction === k ? null : k)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                comment.viewerReaction === k
                  ? "border-[var(--primary)] bg-[var(--primary)]/12 text-[var(--primary)]"
                  : "border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:bg-[var(--section-light)]"
              }`}
            >
              {labels[k]} · {comment.reactions[k]}
            </button>
          ) : (
            <a
              key={k}
              href={discussionLoginHref}
              className="rounded-full border border-[var(--border)] bg-[var(--section-light)] px-2.5 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]/15"
            >
              {labels[k]} · {comment.reactions[k]} — sign in
            </a>
          ),
        )}
      </div>
      {!small && canEngage ? (
        <button type="button" className={`mt-2 text-xs ${primaryLinkClass}`} onClick={onReply}>
          Reply
        </button>
      ) : null}
    </div>
  );
}
