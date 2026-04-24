"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { focusRingSmClass } from "@/lib/primary-link-styles";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          turnstileToken: turnstileToken ?? undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-center text-sm font-medium text-[var(--foreground)] sm:text-left">
        Get accountability updates
      </p>
      <FormTurnstile
        ref={turnstileRef}
        action="newsletter"
        onTokenChange={setTurnstileToken}
        className="flex justify-start"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === "loading"}
          className={`min-h-[56px] w-full touch-manipulation rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] shadow-[var(--shadow-card)] transition-shadow duration-200 placeholder:text-[var(--muted-foreground)]/70 focus-visible:border-[var(--primary)]/35 sm:min-h-[60px] sm:py-5 sm:w-80 sm:max-w-md ${focusRingSmClass}`}
          aria-label="Email address"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={status === "loading" || (isTurnstileWidgetEnabled && !turnstileToken)}
          className="min-h-[56px] w-full justify-center rounded-xl font-semibold sm:min-h-[60px] sm:w-auto sm:shrink-0"
        >
          {status === "loading" ? "Joining…" : "Get updates"}
        </Button>
      </div>
      {status === "success" && (
        <p className="w-full text-center text-sm font-medium text-green-700">
          Thank you! Check your inbox to confirm.
        </p>
      )}
      {status === "error" && (
        <p className="w-full text-center text-sm font-medium text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
