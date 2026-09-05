import { describe, expect, it } from "vitest";

import {
  parseVoiceVerificationBrowseFilter,
  publicExperienceVerificationLabel,
  voiceVerificationBrowseWhere,
} from "@/lib/reports/voice-verification-filter";

describe("parseVoiceVerificationBrowseFilter", () => {
  it("accepts verified and unverified", () => {
    expect(parseVoiceVerificationBrowseFilter("verified")).toBe("verified");
    expect(parseVoiceVerificationBrowseFilter("UNVERIFIED")).toBe("unverified");
    expect(parseVoiceVerificationBrowseFilter("all")).toBeNull();
    expect(parseVoiceVerificationBrowseFilter(undefined)).toBeNull();
  });
});

describe("voiceVerificationBrowseWhere", () => {
  it("maps public filters to staff tiers", () => {
    expect(voiceVerificationBrowseWhere("unverified")).toEqual({
      experienceVerificationTier: "UNVERIFIED",
    });
    expect(voiceVerificationBrowseWhere("verified")).toEqual({
      experienceVerificationTier: { in: ["CORROBORATED", "DOCUMENTED"] },
    });
    expect(voiceVerificationBrowseWhere(null)).toBeUndefined();
  });
});

describe("publicExperienceVerificationLabel", () => {
  it("collapses staff tiers for public badges", () => {
    expect(publicExperienceVerificationLabel("UNVERIFIED")).toBe("Unverified");
    expect(publicExperienceVerificationLabel("CORROBORATED")).toBe("Verified");
    expect(publicExperienceVerificationLabel("DOCUMENTED")).toBe("Verified");
  });
});
