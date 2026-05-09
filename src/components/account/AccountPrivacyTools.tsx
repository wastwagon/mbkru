"use client";

import { useEffect, useState } from "react";

import { focusRingSmClass, prosePrimaryAnchorClass } from "@/lib/primary-link-styles";

export function AccountPrivacyTools({ accountEmail }: { accountEmail: string }) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!deleteOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDeleteOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deleteOpen]);

  async function downloadExport() {
    setMessage(null);
    setBusy("export");
    try {
      const res = await fetch("/api/account/data-export", { credentials: "include" });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setMessage({ kind: "err", text: j?.error ?? `Export failed (${res.status})` });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mbkru-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ kind: "ok", text: "Download started — check your downloads folder." });
    } catch {
      setMessage({ kind: "err", text: "Could not download export. Try again." });
    } finally {
      setBusy(null);
    }
  }

  async function submitDelete() {
    setMessage(null);
    setBusy("delete");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirmEmail.trim() }),
      });
      const j = (await res.json().catch(() => null)) as { error?: string; code?: string } | null;
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      setMessage({
        kind: "err",
        text: j?.error ?? `Could not delete account (${res.status})`,
      });
    } catch {
      setMessage({ kind: "err", text: "Network error. Try again." });
    } finally {
      setBusy(null);
    }
  }

  const btnClass = `min-h-11 touch-manipulation rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99] motion-reduce:active:scale-100 ${focusRingSmClass}`;

  return (
    <section className="mt-10" aria-labelledby="privacy-data-heading">
      <h2 id="privacy-data-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
        Privacy &amp; your data
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Download a machine-readable copy of the information we hold for this account, or permanently delete the account.
        See also our{" "}
        <a href="/privacy" className={prosePrimaryAnchorClass}>
          Privacy Policy
        </a>
        .
      </p>

      {message ? (
        <p
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role={message.kind === "err" ? "alert" : undefined}
        >
          {message.text}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => void downloadExport()}
          disabled={busy !== null}
          className={`${btnClass} bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] disabled:opacity-60`}
        >
          {busy === "export" ? "Preparing…" : "Download data export (JSON)"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDeleteOpen(true);
            setConfirmEmail("");
            setMessage(null);
          }}
          disabled={busy !== null}
          className={`${btnClass} border border-red-200 bg-white text-red-800 hover:bg-red-50 disabled:opacity-60`}
        >
          Delete account…
        </button>
      </div>

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-account-title" className="font-display text-lg font-bold text-[var(--foreground)]">
              Delete your account?
            </h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              This removes your member profile, community posts you authored, and related activity. Voice reports you filed
              stay in the system with your identity unlinked where our retention rules require. You cannot delete your
              account if you created petitions — contact support in that case.
            </p>
            <p className="mt-3 text-xs font-medium text-[var(--foreground)]">
              Signed in as <span className="break-all">{accountEmail}</span>
            </p>
            <label htmlFor="confirm-delete-email" className="mt-4 block text-sm font-semibold text-[var(--foreground)]">
              Type your email to confirm
            </label>
            <input
              id="confirm-delete-email"
              type="email"
              autoComplete="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className={`mt-2 w-full rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
              placeholder={accountEmail}
            />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className={`${btnClass} border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--section-light)]`}
                onClick={() => setDeleteOpen(false)}
                disabled={busy !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${btnClass} bg-red-700 text-white hover:bg-red-800 disabled:opacity-60`}
                onClick={() => void submitDelete()}
                disabled={busy !== null || confirmEmail.trim().toLowerCase() !== accountEmail.trim().toLowerCase()}
              >
                {busy === "delete" ? "Deleting…" : "Permanently delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
