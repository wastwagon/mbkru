"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { redirectToMemberLogin } from "@/lib/client/member-login-redirect";
import { focusRingSmClass } from "@/lib/primary-link-styles";

const labelClass = "mb-1.5 block text-xs font-semibold text-[var(--foreground-secondary)] sm:text-sm";

const inputClass =
  `mt-0 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-mono text-base uppercase tracking-wider text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("code")?.toUpperCase().trim() ?? "";

  const [authStatus, setAuthStatus] = useState<"loading" | "signedOut" | "signedIn">("loading");
  const [code, setCode] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StatusPayload | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { member?: unknown }) => setAuthStatus(d.member ? "signedIn" : "signedOut"))
      .catch(() => setAuthStatus("signedOut"));
  }, []);

  useEffect(() => {
    if (authStatus !== "signedOut") return;
    redirectToMemberLogin(router, pathname || "/track-report");
  }, [authStatus, pathname, router]);

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
      const res = await fetch(`/api/reports/track/${encodeURIComponent(c)}`, { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as StatusPayload & { error?: string };
      if (res.status === 401) {
        redirectToMemberLogin(router, pathname || "/track-report");
        return;
      }
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

  if (authStatus === "loading") {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-[var(--foreground-secondary)]">Checking sign-in…</p>
      </div>
    );
  }

  if (authStatus === "signedOut") {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-[var(--foreground-secondary)]">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={lookup} className="space-y-4">
      <div>
        <label htmlFor="code" className={labelClass}>
          Tracking code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={inputClass}
          placeholder="e.g. ABCD2345EFGH"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {result ? (
        <div className="rounded-xl border border-[var(--accent-gold)]/35 bg-[var(--accent-gold-light)] p-4 text-sm shadow-sm">
          <p className="text-xs font-semibold text-[var(--accent-gold)]">Citizen receipt</p>
          <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[var(--foreground)]">{result.trackingCode}</p>
          <div className="mt-3 space-y-1.5 text-[var(--foreground-secondary)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Status:</span>{" "}
              {result.status.replace(/_/g, " ")}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Type:</span>{" "}
              {result.kind.replace(/_/g, " ")}
            </p>
            <p className="text-xs">
              <span className="font-semibold text-[var(--foreground)]">Submitted</span>{" "}
              <time dateTime={result.createdAt}>{formatSubmissionDateTime(result.createdAt)}</time>
            </p>
            <p className="text-xs">
              <span className="font-semibold text-[var(--foreground)]">Last updated</span>{" "}
              <time dateTime={result.updatedAt}>{formatSubmissionDateTime(result.updatedAt)}</time>
            </p>
          </div>
          {(result.visibleTeamNoteCount ?? result.adminReplies?.length ?? 0) > 0 ? (
            <p className="mt-3 text-xs text-[var(--foreground-secondary)]">
              <span className="font-semibold text-[var(--foreground)]">
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
            <div className="mt-4 rounded-lg border border-[var(--border)] bg-white p-3">
              <p className="text-xs font-semibold text-[var(--foreground)]">Notes from MBKRU</p>
              <ul className="mt-2 space-y-3">
                {result.adminReplies.map((r) => (
                  <li key={r.id}>
                    <p className="text-xs text-[var(--foreground-secondary)]">
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
      <Button type="submit" disabled={loading} className="min-h-11 w-full justify-center sm:w-auto">
        {loading ? "Checking…" : "Check status"}
      </Button>
    </form>
  );
}

export function TrackReportLookup() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--foreground-secondary)]">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}
