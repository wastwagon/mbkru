"use client";

/** Loaded only via `PreLaunchLeadCaptureFormSlot` (phases 1–3). Not used on phase 4 public builds. */

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          disabled={status === "loading"}
          className="!mt-0 min-h-[48px] flex-1 py-3.5 sm:min-w-0"
          aria-label="Email for early access"
        />
        <Button
          type="submit"
          loading={status === "loading"}
          loadingLabel="Registering…"
          disabled={isTurnstileWidgetEnabled && !turnstileToken}
          className="w-full justify-center sm:w-auto"
        >
          Register for Early Access
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
