"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { useForm, Controller, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { focusRingSmClass, focusRingWithinSmClass } from "@/lib/primary-link-styles";
import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

const schema = z.object({
  fullName: z.string().min(1, "Please enter your full name").max(200),
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email").max(320),
  dateOfVisit: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the date of your visit"),
  durationOfStay: z.string().min(1, "Please describe duration of stay").max(240),
  eventsAttended: z.string().min(1, "Please list events or programmes").max(10_000),
  overallRating: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  meaningfulAspects: z.string().min(1, "Please share what was most meaningful").max(10_000),
  suggestionsImprovement: z.string().min(1, "Please share suggestions").max(10_000),
  returnOrInvest: z.enum(["YES", "NO", "MAYBE"]),
  signature: z.string().min(1, "Please type your full name as signature").max(200),
  formSignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the form date"),
});

type FormData = z.infer<typeof schema>;

const inputBase = `mt-1.5 block w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--foreground)] transition-shadow placeholder:text-[var(--muted-foreground)]/70 hover:border-[var(--primary)]/25 focus-visible:border-[var(--primary)]/35 ${focusRingSmClass} disabled:opacity-60`;

const labelClass = "block text-sm font-medium text-[var(--foreground)]";
const sectionTitle = "font-display text-lg font-semibold text-[var(--foreground)]";
const radioCard = `flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-medium transition-shadow ${focusRingWithinSmClass} has-[:checked]:border-[var(--primary)] has-[:checked]:bg-[var(--primary)]/5 has-[:checked]:text-[var(--foreground)]`;

function todayIsoDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const SUBMIT_TIMEOUT_MS = 45_000;
const SUBMIT_TIMEOUT_SEC = Math.round(SUBMIT_TIMEOUT_MS / 1000);

const DIASPORA_SUBMIT_ERROR_FALLBACK =
  "The server returned an error or dropped the connection. Try again in a few minutes or email info@mbkruadvocates.org.";

/** User-visible explanation; always returns non-empty text. */
function describeDiasporaSubmitError(e: unknown): string {
  const isAbort =
    typeof e === "object" &&
    e !== null &&
    "name" in e &&
    (e as { name: unknown }).name === "AbortError";
  if (isAbort) {
    return `The server did not finish within about ${SUBMIT_TIMEOUT_SEC} seconds, so the request was stopped. That usually means the website or database is slow or unreachable—not a problem with your answers. Wait a few minutes and try again, or email info@mbkruadvocates.org.`;
  }
  if (e instanceof Error) {
    const m = e.message.trim();
    if (
      m === "Failed to fetch" ||
      m === "Load failed" ||
      m === "NetworkError when attempting to fetch resource."
    ) {
      return "Your browser could not reach the server. Check your connection and try again, or email info@mbkruadvocates.org.";
    }
    if (m && m !== "Failed") {
      return `${m} If this keeps happening, email info@mbkruadvocates.org.`;
    }
  }
  return DIASPORA_SUBMIT_ERROR_FALLBACK;
}

export function DiasporaFeedbackForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receivedAtIso, setReceivedAtIso] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      dateOfVisit: "",
      durationOfStay: "",
      eventsAttended: "",
      meaningfulAspects: "",
      suggestionsImprovement: "",
      signature: "",
      formSignedDate: todayIsoDate(),
    } as DefaultValues<FormData>,
  });

  async function onSubmit(data: FormData) {
    setStatus("idle");
    setErrorMessage(null);
    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), SUBMIT_TIMEOUT_MS);
    try {
      const res = await fetch("/api/diaspora-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
        }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(j?.error ?? `Request failed (${res.status})`);
      }
      const okJson = (await res.json().catch(() => ({}))) as { receivedAt?: string };
      setErrorMessage(null);
      setReceivedAtIso(okJson.receivedAt ?? new Date().toISOString());
      setStatus("success");
      reset({
        fullName: "",
        email: "",
        dateOfVisit: "",
        durationOfStay: "",
        eventsAttended: "",
        meaningfulAspects: "",
        suggestionsImprovement: "",
        signature: "",
        formSignedDate: todayIsoDate(),
      } as DefaultValues<FormData>);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (e) {
      setReceivedAtIso(null);
      setStatus("error");
      setErrorMessage(describeDiasporaSubmitError(e));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/40 p-6 sm:p-8">
        <h2 className={sectionTitle}>Your visit</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className={labelClass}>
              1. Full name
            </label>
            <input id="fullName" type="text" autoComplete="name" className={inputBase} {...register("fullName")} />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="email" className={labelClass}>
              2. Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputBase}
              {...register("email")}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              Required so the team can follow up on your feedback. This is not the same as creating a member account.
            </p>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="dateOfVisit" className={labelClass}>
              3. Date of visit
            </label>
            <input id="dateOfVisit" type="date" className={inputBase} {...register("dateOfVisit")} />
            {errors.dateOfVisit && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.dateOfVisit.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="durationOfStay" className={labelClass}>
              4. Duration of stay
            </label>
            <input
              id="durationOfStay"
              type="text"
              placeholder="e.g. 2 weeks, 10 days"
              className={inputBase}
              {...register("durationOfStay")}
            />
            {errors.durationOfStay && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.durationOfStay.message}
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="eventsAttended" className={labelClass}>
              5. Events / programmes attended
            </label>
            <textarea
              id="eventsAttended"
              rows={3}
              placeholder="Summits, community visits, meetings, tours…"
              className={`${inputBase} min-h-[100px] resize-y`}
              {...register("eventsAttended")}
            />
            {errors.eventsAttended && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.eventsAttended.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <h2 className={sectionTitle}>Your experience</h2>
        <fieldset className="mt-6">
          <legend className={labelClass}>6. How would you rate your overall experience in Ghana?</legend>
          <Controller
            name="overallRating"
            control={control}
            render={({ field }) => (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  [
                    ["EXCELLENT", "Excellent"],
                    ["GOOD", "Good"],
                    ["FAIR", "Fair"],
                    ["POOR", "Poor"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={radioCard}>
                    <input
                      type="radio"
                      value={value}
                      checked={field.value === value}
                      onChange={() => field.onChange(value)}
                      className="h-4 w-4 shrink-0 border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.overallRating && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.overallRating.message}
            </p>
          )}
        </fieldset>

        <div className="mt-8">
          <label htmlFor="meaningfulAspects" className={labelClass}>
            7. What aspects of your visit were most meaningful?
          </label>
          <textarea
            id="meaningfulAspects"
            rows={4}
            className={`${inputBase} min-h-[120px] resize-y`}
            {...register("meaningfulAspects")}
          />
          {errors.meaningfulAspects && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.meaningfulAspects.message}
            </p>
          )}
        </div>

        <div className="mt-8">
          <label htmlFor="suggestionsImprovement" className={labelClass}>
            8. Suggestions for improvement
          </label>
          <textarea
            id="suggestionsImprovement"
            rows={4}
            className={`${inputBase} min-h-[120px] resize-y`}
            {...register("suggestionsImprovement")}
          />
          {errors.suggestionsImprovement && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.suggestionsImprovement.message}
            </p>
          )}
        </div>

        <fieldset className="mt-8">
          <legend className={labelClass}>9. Would you consider returning or investing in Ghana?</legend>
          <Controller
            name="returnOrInvest"
            control={control}
            render={({ field }) => (
              <div className="mt-3 flex flex-wrap gap-3">
                {(
                  [
                    ["YES", "Yes"],
                    ["NO", "No"],
                    ["MAYBE", "Maybe"],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className={radioCard}>
                    <input
                      type="radio"
                      value={value}
                      checked={field.value === value}
                      onChange={() => field.onChange(value)}
                      className="h-4 w-4 shrink-0 border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.returnOrInvest && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.returnOrInvest.message}
            </p>
          )}
        </fieldset>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--section-light)]/40 p-6 sm:p-8">
        <h2 className={sectionTitle}>Declaration</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="signature" className={labelClass}>
              Signature (type your full name)
            </label>
            <input id="signature" type="text" className={inputBase} {...register("signature")} />
            {errors.signature && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.signature.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="formSignedDate" className={labelClass}>
              Date
            </label>
            <input id="formSignedDate" type="date" className={inputBase} {...register("formSignedDate")} />
            {errors.formSignedDate && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.formSignedDate.message}
              </p>
            )}
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">You may use today&apos;s date if this form is completed now.</p>
          </div>
        </div>
      </section>

      <FormTurnstile ref={turnstileRef} action="diaspora-feedback" onTokenChange={setTurnstileToken} className="flex justify-start" />

      {status === "success" && (
        <div
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-900"
          role="status"
        >
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-sm font-semibold">Thank you for your feedback.</p>
            {receivedAtIso ? (
              <p className="mt-1 text-xs text-green-900/85">
                We received it on{" "}
                <time dateTime={receivedAtIso}>{formatSubmissionDateTime(receivedAtIso)}</time>.
              </p>
            ) : null}
            <p className="mt-1 text-sm text-green-800/90">
              We appreciate you taking the time to share your experience; it helps us strengthen diaspora engagement and
              programme follow-up.
            </p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900" role="alert">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm">
            <p className="font-semibold text-red-950">We could not send your feedback.</p>
            <p className="mt-2 font-normal leading-relaxed text-red-900/95">
              {errorMessage ?? DIASPORA_SUBMIT_ERROR_FALLBACK}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || (isTurnstileWidgetEnabled && !turnstileToken)}
          size="lg"
          className="w-full min-w-0 justify-center sm:w-auto sm:min-w-[200px]"
        >
          {isSubmitting ? (
            <>
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
              Submitting…
            </>
          ) : (
            "Submit feedback"
          )}
        </Button>
        <p className="max-w-md text-xs text-[var(--muted-foreground)]">
          Submissions are stored securely for programme records, including your email for follow-up. MBKRU does not use
          this form for party-political campaigning.
        </p>
      </div>
    </form>
  );
}
