import { z } from "zod";

import {
  isMbkruVoiceAnalyticsEventName,
  type MbkruVoiceAnalyticsEventName,
} from "@/lib/mbkru-voice-analytics-taxonomy";

/** Re-export allowlist for tests and tooling. */
export {
  MBKRU_VOICE_ANALYTICS_EVENT_NAMES,
  MBKRU_VOICE_ANALYTICS_TAXONOMY,
  type MbkruVoiceAnalyticsEventName,
} from "@/lib/mbkru-voice-analytics-taxonomy";

/** Keep in sync with `voiceLanguageOptions` ids in `@/lib/voice-languages`. */
export const mbkruVoiceChatLanguageIds = ["en-gh", "twi", "ga", "hausa", "ewe"] as const;

export const mbkruVoiceLanguageIdSchema = z.enum(mbkruVoiceChatLanguageIds);

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(1000),
});

export const mbkruVoiceChatBodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  languageId: mbkruVoiceLanguageIdSchema.optional(),
  history: z.array(chatTurnSchema).max(24).optional(),
});

const analyticsEventNameSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.custom<MbkruVoiceAnalyticsEventName>(
    (val): val is MbkruVoiceAnalyticsEventName => typeof val === "string" && isMbkruVoiceAnalyticsEventName(val),
  ),
);

export const mbkruVoiceAnalyticsBodySchema = z.object({
  name: analyticsEventNameSchema,
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  token: z.string().max(5000).optional(),
});
