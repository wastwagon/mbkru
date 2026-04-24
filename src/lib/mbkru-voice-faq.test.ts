import { describe, expect, it } from "vitest";

import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";

describe("getMbkruVoiceFallbackReply", () => {
  it("returns report guidance links for report intent", () => {
    const result = getMbkruVoiceFallbackReply("I need to report an issue");
    expect(result.answer.toLowerCase()).toContain("citizens voice");
    expect(result.suggestedLinks?.some((link) => link.href === "/track-report")).toBe(true);
  });

  it("applies language profile prefix for Twi", () => {
    const result = getMbkruVoiceFallbackReply("help me", "twi");
    expect(result.answer.startsWith("Twi guidance:")).toBe(true);
  });

  it("defaults to English profile when language omitted", () => {
    const result = getMbkruVoiceFallbackReply("help me");
    expect(result.answer.startsWith("Twi guidance:")).toBe(false);
  });
});
