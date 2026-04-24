import { describe, expect, it } from "vitest";

import { voiceLanguageOptions } from "@/lib/voice-languages";

import {
  MBKRU_VOICE_ANALYTICS_EVENT_NAMES,
  mbkruVoiceAnalyticsBodySchema,
  mbkruVoiceChatBodySchema,
  mbkruVoiceChatLanguageIds,
} from "./mbkru-voice";

describe("mbkruVoiceChatBodySchema", () => {
  it("accepts minimal message and optional history", () => {
    const r = mbkruVoiceChatBodySchema.safeParse({
      message: " Hello ",
      languageId: "twi",
      history: [{ role: "user", content: "Hi" }],
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.message).toBe("Hello");
      expect(r.data.languageId).toBe("twi");
    }
  });

  it("rejects unknown languageId", () => {
    const r = mbkruVoiceChatBodySchema.safeParse({ message: "x", languageId: "fr" });
    expect(r.success).toBe(false);
  });

  it("keeps language ids aligned with voiceLanguageOptions", () => {
    expect(voiceLanguageOptions.map((o) => o.id)).toEqual([...mbkruVoiceChatLanguageIds]);
  });
});

describe("mbkruVoiceAnalyticsBodySchema", () => {
  it("normalizes event name to lowercase", () => {
    const r = mbkruVoiceAnalyticsBodySchema.safeParse({ name: "MBKRU_VOICE_SEND", payload: {} });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.name).toBe("mbkru_voice_send");
  });

  it("rejects unknown events", () => {
    const r = mbkruVoiceAnalyticsBodySchema.safeParse({ name: "unknown", payload: {} });
    expect(r.success).toBe(false);
  });

  it("defaults payload to empty object", () => {
    const r = mbkruVoiceAnalyticsBodySchema.safeParse({ name: "mbkru_voice_open_launcher" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.payload).toEqual({});
  });

  it("exposes the full allowlist for ingestion", () => {
    expect(MBKRU_VOICE_ANALYTICS_EVENT_NAMES).toContain("mbkru_voice_clear_chat");
    expect(MBKRU_VOICE_ANALYTICS_EVENT_NAMES).toContain("accessibility_stt_result");
  });
});
