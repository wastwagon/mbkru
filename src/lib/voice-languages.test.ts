import { describe, expect, it } from "vitest";

import { defaultVoicePreferences, findVoiceLanguage, voiceLanguageOptions } from "@/lib/voice-languages";

describe("voice language configuration", () => {
  it("contains required local languages", () => {
    const ids = voiceLanguageOptions.map((option) => option.id);
    expect(ids).toContain("twi");
    expect(ids).toContain("ga");
    expect(ids).toContain("hausa");
    expect(ids).toContain("ewe");
  });

  it("returns a valid language for default preferences", () => {
    const selected = findVoiceLanguage(defaultVoicePreferences.languageId);
    expect(selected.id).toBe(defaultVoicePreferences.languageId);
    expect(selected.recognitionLang.length).toBeGreaterThan(0);
    expect(selected.synthesisLang.length).toBeGreaterThan(0);
  });

  it("falls back to first language for unknown id", () => {
    const selected = findVoiceLanguage("unknown-id" as never);
    expect(selected.id).toBe(voiceLanguageOptions[0].id);
  });
});
