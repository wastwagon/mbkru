"use client";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export function trackUiEvent(name: string, payload: EventPayload = {}) {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  }

  if (typeof window.plausible === "function") {
    window.plausible(name, { props: payload });
  }

  const analyticsBody = JSON.stringify({ name, payload });
  const token = process.env.NEXT_PUBLIC_MBKRU_VOICE_EVENT_TOKEN?.trim();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-MBKRU-Event-Token"] = token;
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const payloadBody = token ? JSON.stringify({ name, payload, token }) : analyticsBody;
    const blob = new Blob([payloadBody], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/mbkru-voice-event", blob);
    return;
  }

  void fetch("/api/analytics/mbkru-voice-event", {
    method: "POST",
    headers,
    body: analyticsBody,
    keepalive: true,
  });
}
