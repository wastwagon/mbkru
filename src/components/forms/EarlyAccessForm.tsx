"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { focusRingSmClass } from "@/lib/primary-link-styles";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const turnstileRef = useRef<TurnstileInstance>(undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const formData = new FormData();
      formData.set("email", email);
      if (turnstileToken) formData.set("turnstileToken", turnstileToken);
      const res = await fetch("/api/early-access", {
        method: "POST",
        body: formData,
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
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <FormTurnstile
        ref={turnstileRef}
        action="early_access"
        onTokenChange={setTurnstileToken}
        className="flex justify-start"
      />
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={status === "loading"}
          className={`min-h-[48px] w-full flex-1 touch-manipulation rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-[var(--foreground)] transition-shadow duration-200 placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--primary)]/35 sm:min-w-0 ${focusRingSmClass}`}
          aria-label="Email for early access"
        />
        <Button
          type="submit"
          disabled={status === "loading" || (isTurnstileWidgetEnabled && !turnstileToken)}
          className="w-full justify-center sm:w-auto"
        >
          {status === "loading" ? "Registering…" : "Register for Early Access"}
        </Button>
      </div>
      {status === "success" && (
        <p className="text-sm text-green-600">Thank you! We&apos;ll be in touch.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
