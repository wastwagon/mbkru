import { describe, expect, it } from "vitest";

import { getAccessibilityVoiceStrings } from "@/lib/voice-ui-i18n";

describe("accessibility display theme i18n", () => {
  it("includes localized theme labels for every voice UI language", () => {
    for (const lang of ["en-gh", "twi", "ga", "hausa", "ewe"] as const) {
      const s = getAccessibilityVoiceStrings(lang);
      expect(s.displayThemeLabel.length).toBeGreaterThan(2);
      expect(s.displayThemeSystem.length).toBeGreaterThan(2);
      expect(s.displayThemeNote).toMatch(/footer|Footer|teal|Teal|Voice/i);
    }
  });

  it("uses Ewe-specific system theme label", () => {
    const s = getAccessibilityVoiceStrings("ewe");
    expect(s.displayThemeSystem).toMatch(/device/i);
  });
});
