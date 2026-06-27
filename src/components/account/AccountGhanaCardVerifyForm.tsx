"use client";

import type { MemberGhanaCardVerificationStatus } from "@prisma/client";
import { useState } from "react";

import { FormTurnstile, isTurnstileWidgetEnabled } from "@/components/forms/FormTurnstile";
import { ghanaCardStatusDescription, ghanaCardStatusLabel } from "@/lib/ghana-card-labels";
import { focusRingSmClass } from "@/lib/primary-link-styles";

const inputClass = `mt-1 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow focus-visible:border-[var(--primary)]/35 ${focusRingSmClass}`;

type Props = {
  status: MemberGhanaCardVerificationStatus;
  verifiedAt: Date | null;
  lastFour: string | null;
  hubtelConfigured: boolean;
};

export function AccountGhanaCardVerifyForm({ status, verifiedAt, lastFour, hubtelConfigured }: Props) {
  const [ghanaCardNumber, setGhanaCardNumber] = useState("");
  const [surname, setSurname] = useState("");
  const [forenames, setForenames] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/member/ghana-card/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghanaCardNumber,
          surname,
          forenames,
          ...(dateOfBirth.trim() ? { dateOfBirth: dateOfBirth.trim() } : {}),
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      setSuccess(true);
      setGhanaCardNumber("");
      window.location.reload();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="ghana-card-verify"
      className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--section-light)]/50 p-4 sm:p-5"
      aria-labelledby="ghana-card-heading"
    >
      <h2 id="ghana-card-heading" className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-secondary)]">
        Ghana Card verification
      </h2>
      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{ghanaCardStatusLabel(status)}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--foreground-secondary)]">
        {ghanaCardStatusDescription(status)}
      </p>
      {status === "VERIFIED" && verifiedAt ? (
        <p className="mt-2 text-[11px] text-[var(--foreground-secondary)]">
          Verified {verifiedAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}
          {lastFour ? ` · ending ${lastFour}` : null}
        </p>
      ) : null}

      {status !== "VERIFIED" ? (
        hubtelConfigured ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-3 border-t border-[var(--border)] pt-4">
            <p className="text-xs text-[var(--foreground-secondary)]">
              Enter the details exactly as on your Ghana Card. We verify via Hubtel against NIA records and store only a
              secure hash — not your full card number.
            </p>
            <div>
              <label htmlFor="ghana-card-number" className="block text-xs font-medium text-[var(--foreground)]">
                Ghana Card number
              </label>
              <input
                id="ghana-card-number"
                required
                autoComplete="off"
                inputMode="text"
                placeholder="GHA-123456789-0"
                value={ghanaCardNumber}
                onChange={(e) => setGhanaCardNumber(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="ghana-card-surname" className="block text-xs font-medium text-[var(--foreground)]">
                  Surname (legal)
                </label>
                <input
                  id="ghana-card-surname"
                  required
                  autoComplete="family-name"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ghana-card-forenames" className="block text-xs font-medium text-[var(--foreground)]">
                  Forenames (legal)
                </label>
                <input
                  id="ghana-card-forenames"
                  required
                  autoComplete="given-name"
                  value={forenames}
                  onChange={(e) => setForenames(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ghana-card-dob" className="block text-xs font-medium text-[var(--foreground)]">
                Date of birth <span className="font-normal text-[var(--foreground-secondary)]">(optional)</span>
              </label>
              <input
                id="ghana-card-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
            </div>
            {isTurnstileWidgetEnabled ? (
              <FormTurnstile onTokenChange={setTurnstileToken} action="ghana-card-verify" />
            ) : null}
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="text-sm text-[var(--primary)]" role="status">
                Verified — refreshing…
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading || (isTurnstileWidgetEnabled && !turnstileToken)}
              className={`min-h-11 touch-manipulation rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] disabled:opacity-60 ${focusRingSmClass}`}
            >
              {loading ? "Verifying…" : "Verify Ghana Card"}
            </button>
          </form>
        ) : (
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs text-[var(--foreground-secondary)]">
            Ghana Card verification is not enabled on this deployment yet. MP performance submissions will require it when
            Hubtel credentials are configured.
          </p>
        )
      ) : null}
    </section>
  );
}
