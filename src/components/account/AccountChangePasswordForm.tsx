"use client";

import { useState } from "react";

import { PasswordInput } from "@/components/ui/PasswordInput";
import { focusRingSmClass } from "@/lib/primary-link-styles";

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

export function AccountChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not update password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
      <p className="text-xs text-[var(--foreground-secondary)]">
        Use at least 8 characters. If you received a temporary password from MBKRU, set a new one here.
      </p>
      <div>
        <label htmlFor="current-password" className="block text-xs font-medium text-[var(--foreground)]">
          Current password
        </label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-xs font-medium text-[var(--foreground)]">
          New password
        </label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-xs font-medium text-[var(--foreground)]">
          Confirm new password
        </label>
        <PasswordInput
          id="confirm-password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-green-800" role="status">
          Password updated.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className={`min-h-11 touch-manipulation rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
