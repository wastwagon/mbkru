"use client";

import { useCallback, useEffect, useState } from "react";

import { FormTurnstile, isTurnstileWidgetEnabled } from "@/components/forms/FormTurnstile";
import { primaryLinkClass } from "@/lib/primary-link-styles";

type Me = { email: string; displayName: string | null };

type Props = {
  slug: string;
  initialCount: number;
  initialViewerSigned: boolean;
  targetSignatures: number | null;
  me: Me | null;
  /** When true, guests get a confirmation link by email before their signature counts. */
  guestEmailVerificationEnabled?: boolean;
};

export function PetitionSignPanel({
  slug,
  initialCount,
  initialViewerSigned,
  targetSignatures,
  me,
  guestEmailVerificationEnabled = false,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [viewerSigned, setViewerSigned] = useState(initialViewerSigned);
  const [signerName, setSignerName] = useState(me?.displayName?.trim() ?? "");
  const [signerEmail, setSignerEmail] = useState(me?.email ?? "");
  const [consentShowName, setConsentShowName] = useState(false);
  const [consentUpdates, setConsentUpdates] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailSent, setVerifyEmailSent] = useState(false);

  useEffect(() => {
    setSignerEmail(me?.email ?? "");
    setSignerName(me?.displayName?.trim() ?? "");
  }, [me]);

  const sync = useCallback(async () => {
    const res = await fetch(`/api/petitions/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      petition?: { signatureCount?: number; viewerSigned?: boolean };
    };
    if (typeof data.petition?.signatureCount === "number") setCount(data.petition.signatureCount);
    if (typeof data.petition?.viewerSigned === "boolean") setViewerSigned(data.petition.viewerSigned);
  }, [slug]);

  useEffect(() => {
    void sync();
  }, [sync]);

  async function onSign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/petitions/${encodeURIComponent(slug)}/sign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signerName: signerName.trim() || null,
          signerEmail: signerEmail.trim().toLowerCase(),
          consentShowName,
          consentUpdates,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        signatureCount?: number;
        verificationPending?: boolean;
        alreadySigned?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not sign.");
        return;
      }
      if (data.verificationPending) {
        setVerifyEmailSent(true);
        setTurnstileToken(null);
        return;
      }
      if (typeof data.signatureCount === "number") setCount(data.signatureCount);
      if (data.alreadySigned) {
        setViewerSigned(true);
        setTurnstileToken(null);
        return;
      }
      setViewerSigned(true);
      setTurnstileToken(null);
    } finally {
      setBusy(false);
    }
  }

  async function onWithdraw() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/petitions/${encodeURIComponent(slug)}/sign`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; signatureCount?: number };
      if (!res.ok) {
        setError(data.error ?? "Could not withdraw.");
        return;
      }
      if (typeof data.signatureCount === "number") setCount(data.signatureCount);
      setViewerSigned(false);
    } finally {
      setBusy(false);
    }
  }

  const pct =
    targetSignatures != null && targetSignatures > 0
      ? Math.min(100, Math.round((count / targetSignatures) * 100))
      : null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">Sign this petition</h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Your email prevents duplicate signatures. Optional updates are only for this petition.
      </p>
      {!me && guestEmailVerificationEnabled ? (
        <p className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950">
          This site sends a <strong className="font-semibold">confirmation link</strong> to your inbox before your
          signature is counted (48-hour link).
        </p>
      ) : null}
      {verifyEmailSent ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950" role="status">
          Check your email and tap <strong className="font-semibold">Confirm</strong> to finish signing. If nothing
          arrives, check spam or try again in a few minutes.
        </p>
      ) : null}
      <p className="mt-4 font-display text-3xl font-bold tabular-nums text-[var(--primary)]">{count}</p>
      <p className="text-xs text-[var(--muted-foreground)]">signatures</p>
      {pct != null ? (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--section-light)]">
          <div className="h-full bg-[var(--primary)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {targetSignatures != null ? (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Goal: {targetSignatures.toLocaleString()}</p>
      ) : null}

      {!me ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          <a href={`/login?next=/petitions/${encodeURIComponent(slug)}`} className={primaryLinkClass}>
            Sign in
          </a>{" "}
          for a quicker flow, or sign below as a guest when Turnstile is off or complete the challenge.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>
      ) : null}

      {me && viewerSigned ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          <p className="font-medium">You are recorded on this petition.</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onWithdraw()}
            className="mt-3 rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold hover:bg-white disabled:opacity-50"
          >
            Withdraw my signature
          </button>
        </div>
      ) : null}

      {!(me && viewerSigned) ? (
        <form onSubmit={onSign} className="mt-6 space-y-4">
          <div>
            <label htmlFor="sig-name" className="block text-xs font-medium text-[var(--foreground)]">
              Name (optional public display)
            </label>
            <input
              id="sig-name"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="sig-email" className="block text-xs font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="sig-email"
              type="email"
              required
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              readOnly={Boolean(me)}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm read-only:bg-[var(--section-light)]/80"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={consentShowName}
              onChange={(e) => setConsentShowName(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border)]"
            />
            <span>I agree my name or label may appear in the recent signers list (never my email).</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={consentUpdates}
              onChange={(e) => setConsentUpdates(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[var(--border)]"
            />
            <span>Email me occasional updates about this petition only.</span>
          </label>
          {!me && isTurnstileWidgetEnabled ? (
            <FormTurnstile action="petition-sign" onTokenChange={setTurnstileToken} />
          ) : null}
          <button
            type="submit"
            disabled={busy || (!me && isTurnstileWidgetEnabled && !turnstileToken)}
            className="w-full rounded-xl bg-[var(--primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-50"
          >
            {busy ? "Signing…" : "Sign petition"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
