"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";
import { focusRingSmClass } from "@/lib/primary-link-styles";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

const contactSchema = z.object({
  enquiryType: z.string().min(1, "Please select an enquiry type"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const inputBase =
  `mt-1 block w-full touch-manipulation rounded-xl border bg-white px-4 py-3.5 text-[var(--foreground)] transition-all duration-200 placeholder:text-[var(--muted-foreground)]/70 focus-visible:border-[var(--primary)]/35 ${focusRingSmClass} disabled:opacity-60 disabled:cursor-not-allowed`;

const inputError = "border-red-400 focus-visible:border-red-400 focus-visible:outline-red-400/80";
const inputNormal = "border-[var(--border)] hover:border-[var(--primary)]/30";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [receivedAtIso, setReceivedAtIso] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      enquiryType: "",
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const messageLength = watch("message", "")?.length ?? 0;
  const minMessageLength = 20;

  async function onSubmit(data: ContactFormData) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      const payload = (await res.json().catch(() => ({}))) as { receivedAt?: string };
      setReceivedAtIso(payload.receivedAt ?? new Date().toISOString());
      setStatus("success");
      reset();
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch {
      setReceivedAtIso(null);
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 space-y-5"
      noValidate
    >
      <div>
        <label htmlFor="enquiryType" className="block text-sm font-medium text-[var(--foreground)]">
          Enquiry type
        </label>
        <select
          id="enquiryType"
          {...register("enquiryType")}
          className={`${inputBase} ${errors.enquiryType ? inputError : inputNormal} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%236b7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
          aria-invalid={!!errors.enquiryType}
        >
          <option value="">Select enquiry type</option>
          <option value="general">General enquiry</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press & media</option>
          <option value="citizen-voice">Citizen voice / complaint</option>
          <option value="other">Other</option>
        </select>
        {errors.enquiryType && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.enquiryType.message}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)]">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Your full name"
            {...register("name")}
            className={`${inputBase} ${errors.name ? inputError : inputNormal}`}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-[var(--foreground)]">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          placeholder="Brief subject of your message"
          {...register("subject")}
          className={`${inputBase} ${errors.subject ? inputError : inputNormal}`}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)]">
            Message
          </label>
          <span
            className={`text-xs ${messageLength >= minMessageLength ? "text-[var(--muted-foreground)]" : "text-amber-600"}`}
          >
            {messageLength}/{minMessageLength} min
          </span>
        </div>
        <textarea
          id="message"
          rows={5}
          placeholder="Tell us how we can help. Include relevant details for faster response."
          {...register("message")}
          className={`${inputBase} resize-y min-h-[120px] ${errors.message ? inputError : inputNormal}`}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      <FormTurnstile
        ref={turnstileRef}
        action="contact"
        onTokenChange={setTurnstileToken}
        className="flex justify-start"
      />

      {status === "success" && (
        <div
          className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800"
          role="status"
        >
          <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="text-sm font-medium text-green-800">
            <p>Thank you. Your message has been sent. We aim to respond within two business days.</p>
            {receivedAtIso ? (
              <p className="mt-2 text-xs font-normal text-green-900/85">
                Logged{" "}
                <time dateTime={receivedAtIso}>{formatSubmissionDateTime(receivedAtIso)}</time>
                {` — `}use this timestamp if you follow up with our team.
              </p>
            ) : null}
          </div>
        </div>
      )}
      {status === "error" && (
        <div
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800"
          role="alert"
        >
          <svg className="h-5 w-5 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">Something went wrong. Please try again or email us directly.</p>
        </div>
      )}

      <div className="pt-1">
        <Button
          type="submit"
          disabled={isSubmitting || (isTurnstileWidgetEnabled && !turnstileToken)}
          size="lg"
          className="w-full min-w-0 justify-center sm:w-auto sm:min-w-[180px]"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 2 9 7.632V19z" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
