"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { prosePrimaryAnchorClass } from "@/lib/primary-link-styles";

export function AccountPrivacyTools({ accountEmail }: { accountEmail: string }) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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

  return (
    <section className="mt-10" aria-labelledby="privacy-data-heading">
      <h2 id="privacy-data-heading" className="font-display text-lg font-semibold text-[var(--foreground)]">
        Privacy &amp; your data
      </h2>
      <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
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
        <Button
          type="button"
          onClick={() => void downloadExport()}
          disabled={busy !== null}
          loading={busy === "export"}
          loadingLabel="Preparing…"
        >
          Download data export (JSON)
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            setDeleteOpen(true);
            setConfirmEmail("");
            setMessage(null);
          }}
          disabled={busy !== null}
        >
          Delete account…
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void submitDelete()}
        title="Delete your account?"
        titleId="delete-account-title"
        description="This removes your member profile, community posts you authored, and related activity. Voice reports you filed stay in the system with your identity unlinked where our retention rules require. You cannot delete your account if you created petitions — contact support in that case."
        confirmLabel="Permanently delete"
        cancelLabel="Cancel"
        destructive
        busy={busy === "delete"}
        busyLabel="Deleting…"
        confirmDisabled={confirmEmail.trim().toLowerCase() !== accountEmail.trim().toLowerCase()}
      >
        <p className="mt-3 text-xs font-medium text-[var(--foreground)]">
          Signed in as <span className="break-all">{accountEmail}</span>
        </p>
        <FormField label="Type your email to confirm" htmlFor="confirm-delete-email" className="mt-4">
          <Input
            id="confirm-delete-email"
            type="email"
            autoComplete="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={accountEmail}
          />
        </FormField>
      </ConfirmDialog>
    </section>
  );
}
