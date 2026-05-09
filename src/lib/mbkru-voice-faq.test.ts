import { describe, expect, it } from "vitest";

import { ACCOUNTABILITY_CATALOGUE_ROUTES } from "@/config/accountability-catalogue-destinations";
import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";

describe("getMbkruVoiceFallbackReply", () => {
  it("returns report guidance links for report intent", () => {
    const result = getMbkruVoiceFallbackReply("I need to report an issue");
    expect(result.answer.toLowerCase()).toContain("citizens voice");
    expect(result.suggestedLinks?.some((link) => link.href === "/track-report")).toBe(true);
  });

  it("returns catalogue and government-preset links for promise intent", () => {
    const result = getMbkruVoiceFallbackReply("Which manifesto commitments are you tracking?");
    expect(result.suggestedLinks?.some((link) => link.href === ACCOUNTABILITY_CATALOGUE_ROUTES.browseAllPromises)).toBe(
      true,
    );
    expect(
      result.suggestedLinks?.some((link) => link.href === ACCOUNTABILITY_CATALOGUE_ROUTES.governmentCommitments),
    ).toBe(true);
  });

  it("returns diaspora signposting when passport or diaspora is mentioned", () => {
    const result = getMbkruVoiceFallbackReply("How do I renew my Ghanaian passport in London?");
    expect(result.answer.toLowerCase()).toContain("diaspora");
    expect(result.suggestedLinks?.some((link) => link.href === "/diaspora")).toBe(true);
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
