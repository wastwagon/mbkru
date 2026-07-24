"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatSubmissionDateTime } from "@/lib/format-submission-datetime";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

const contactSchema = z.object({
  enquiryType: z.string().min(1, "Please select an enquiry type"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
      <FormField label="Enquiry type" htmlFor="enquiryType" error={errors.enquiryType?.message}>
        <Select id="enquiryType" {...register("enquiryType")} invalid={!!errors.enquiryType}>
          <option value="">Select enquiry type</option>
          <option value="general">General enquiry</option>
          <option value="partnership">Partnership</option>
          <option value="press">Press & media</option>
          <option value="citizen-voice">Citizen voice / complaint</option>
          <option value="other">Other</option>
        </Select>
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            {...register("name")}
            invalid={!!errors.name}
          />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            invalid={!!errors.email}
          />
        </FormField>
      </div>

      <FormField label="Subject" htmlFor="subject" error={errors.subject?.message}>
        <Input
          id="subject"
          type="text"
          placeholder="Brief subject of your message"
          {...register("subject")}
          invalid={!!errors.subject}
        />
      </FormField>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="message" className="block text-sm font-medium text-[var(--foreground)]">
            Message
          </label>
          <span
            className={`text-xs ${messageLength >= minMessageLength ? "text-[var(--foreground-secondary)]" : "text-amber-600"}`}
          >
            {messageLength}/{minMessageLength} min
          </span>
        </div>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell us how we can help. Include relevant details for faster response."
          {...register("message")}
          invalid={!!errors.message}
          className="min-h-[120px]"
        />
        {errors.message ? (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.message.message}
          </p>
        ) : null}
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
