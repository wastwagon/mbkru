"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        disabled={status === "loading"}
        className="min-h-[56px] w-full rounded-xl border border-[var(--border)] bg-white px-5 py-4 text-[var(--foreground)] shadow-[var(--shadow-card)] transition-all duration-[400ms] ease-in-out placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 sm:min-h-[60px] sm:py-5 sm:w-80 sm:max-w-md"
        aria-label="Email address"
      />
      <Button
        type="submit"
        variant="primary"
        disabled={status === "loading"}
        className="min-h-[56px] rounded-xl bg-[var(--primary)] font-semibold text-white shadow-md hover:bg-[var(--primary-dark)] hover:shadow-lg sm:min-h-[60px] sm:shrink-0"
      >
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </Button>
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
