"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { focusRingSmClass } from "@/lib/primary-link-styles";

const inputClass =
  `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-mono uppercase tracking-wide text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

type AdminReplyPayload = {
  id: string;
  body: string;
  createdAt: string;
};

type StatusPayload = {
  trackingCode: string;
  kind: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  visibleTeamNoteCount?: number;
  lastVisibleTeamNoteAt?: string | null;
  adminReplies?: AdminReplyPayload[];
};

function Inner() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("code")?.toUpperCase().trim() ?? "";

  const [code, setCode] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusPayload | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const c = code.trim().toUpperCase();
    if (c.length < 8) {
      setError("Enter your full tracking code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/track/${encodeURIComponent(c)}`);
      const data = (await res.json().catch(() => ({}))) as StatusPayload & { error?: string };
      if (!res.ok) {
        setError(data.error === "Not found" ? "No report matches that code." : data.error ?? "Lookup failed.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={lookup} className="space-y-4">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-[var(--foreground)]">
          Tracking code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="e.g. ABCD2345EFGH"
          autoComplete="off"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="rounded-xl border border-[var(--border)] bg-white p-4 text-sm shadow-sm transition-shadow duration-200 motion-reduce:transition-none">
          <p className="font-mono text-[var(--foreground)]">{result.trackingCode}</p>
          <p className="mt-2 text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Status:</span>{" "}
            {result.status.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Type:</span>{" "}
            {result.kind.replace(/_/g, " ")}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Submitted</span>{" "}
            <time dateTime={result.createdAt}>{formatSubmissionDateTime(result.createdAt)}</time>
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
            <span className="font-medium text-[var(--foreground)]">Last updated</span>{" "}
            <time dateTime={result.updatedAt}>{formatSubmissionDateTime(result.updatedAt)}</time>
          </p>
          {(result.visibleTeamNoteCount ?? result.adminReplies?.length ?? 0) > 0 ? (
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              <span className="font-medium text-[var(--foreground)]">
                {result.visibleTeamNoteCount ?? result.adminReplies?.length ?? 0} team note
                {(result.visibleTeamNoteCount ?? result.adminReplies?.length ?? 0) === 1 ? "" : "s"}
              </span>
              {result.lastVisibleTeamNoteAt ? (
                <>
                  {" "}
                  · Latest{" "}
                  <time dateTime={result.lastVisibleTeamNoteAt}>
                    {formatSubmissionDateTime(result.lastVisibleTeamNoteAt)}
                  </time>
                </>
              ) : null}
            </p>
          ) : null}
          {result.adminReplies && result.adminReplies.length > 0 ? (
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Notes from MBKRU
              </p>
              <ul className="mt-2 space-y-3">
                {result.adminReplies.map((r) => (
                  <li key={r.id}>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      <time dateTime={r.createdAt}>{formatSubmissionDateTime(r.createdAt)}</time>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]">{r.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
      <Button type="submit" disabled={loading} className="w-full justify-center sm:w-auto">
        {loading ? "Checking…" : "Check status"}
      </Button>
    </form>
  );
}

export function TrackReportLookup() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted-foreground)]">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}
