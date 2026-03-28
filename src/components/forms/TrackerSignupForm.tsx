"use client";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

import { FormTurnstile, isTurnstileWidgetEnabled } from "./FormTurnstile";

export function TrackerSignupForm() {
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
      const res = await fetch("/api/tracker-signup", {
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
        action="parliament_tracker"
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
          className="flex-1 min-h-[48px] rounded-xl border border-[var(--border)] bg-white px-4 py-3.5 text-[var(--foreground)] transition-all duration-[400ms] ease-in-out placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          aria-label="Email for tracker notifications"
        />
        <Button
          type="submit"
          disabled={status === "loading" || (isTurnstileWidgetEnabled && !turnstileToken)}
        >
          {status === "loading" ? "Signing up…" : "Sign Up"}
        </Button>
      </div>
      {status === "success" && (
        <p className="text-sm text-green-600">Thank you! We&apos;ll notify you at launch.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
