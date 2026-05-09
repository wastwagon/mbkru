import { describe, expect, it } from "vitest";

import { voiceLanguageOptions } from "@/lib/voice-languages";
import {
  getAccessibilityVoiceStrings,
  getVoiceChromeStrings,
  voiceLanguageMenuLabel,
  voiceUiDateLocale,
} from "@/lib/voice-ui-i18n";

const LANG_IDS = voiceLanguageOptions.map((o) => o.id);

describe("voice-ui-i18n", () => {
  it("voiceLanguageMenuLabel returns a non-empty string for every ui × option pair", () => {
    for (const ui of LANG_IDS) {
      for (const opt of LANG_IDS) {
        const s = voiceLanguageMenuLabel(ui, opt);
        expect(s.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("uses Twi-flavoured label for English when UI is Twi", () => {
    expect(voiceLanguageMenuLabel("twi", "en-gh")).toContain("Borɔfo");
  });

  it("uses Hausa-flavoured label for English when UI is Hausa", () => {
    expect(voiceLanguageMenuLabel("hausa", "en-gh")).toContain("Turanci");
  });

  it("uses Ewe autonym when UI is Ewe and option is Ewe", () => {
    expect(voiceLanguageMenuLabel("ewe", "ewe")).toBe("Eʋegbe");
  });

  it("getVoiceChromeStrings falls back to English", () => {
    const s = getVoiceChromeStrings("en-gh");
    expect(s.chatIntro.length).toBeGreaterThan(0);
    expect(s.send).toBe("Send");
  });

  it("getAccessibilityVoiceStrings falls back to English", () => {
    const a = getAccessibilityVoiceStrings("en-gh");
    expect(a.panelTitle).toContain("Voice");
  });

  it("voiceUiDateLocale maps to Ghana-region BCP47 tags", () => {
    expect(voiceUiDateLocale("en-gh")).toBe("en-GH");
    expect(voiceUiDateLocale("twi")).toBe("ak-GH");
    expect(voiceUiDateLocale("ewe")).toBe("ee-GH");
  });
});
