import { describe, expect, it } from "vitest";

import {
  MBKRU_VOICE_ANALYTICS_EVENT_NAMES,
  MBKRU_VOICE_ANALYTICS_TAXONOMY,
  isMbkruVoiceAnalyticsEventName,
} from "./mbkru-voice-analytics-taxonomy";

describe("mbkru-voice-analytics-taxonomy", () => {
  it("has unique event names", () => {
    const names = MBKRU_VOICE_ANALYTICS_TAXONOMY.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("exposes a name list aligned with taxonomy", () => {
    expect(MBKRU_VOICE_ANALYTICS_EVENT_NAMES.length).toBe(MBKRU_VOICE_ANALYTICS_TAXONOMY.length);
    for (const row of MBKRU_VOICE_ANALYTICS_TAXONOMY) {
      expect(MBKRU_VOICE_ANALYTICS_EVENT_NAMES).toContain(row.name);
    }
  });

  it("isMbkruVoiceAnalyticsEventName matches allowlist", () => {
    expect(isMbkruVoiceAnalyticsEventName("mbkru_voice_send")).toBe(true);
    expect(isMbkruVoiceAnalyticsEventName("not_an_event")).toBe(false);
  });
});
