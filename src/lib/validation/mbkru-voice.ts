import { z } from "zod";

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

export const MBKRU_VOICE_ANALYTICS_EVENT_NAMES = [
  "mbkru_voice_open_launcher",
  "mbkru_voice_send",
  "mbkru_voice_reply_received",
  "mbkru_voice_mic_start",
  "mbkru_voice_mic_error",
  "mbkru_voice_clear_chat",
  "accessibility_read_page_summary",
  "accessibility_read_selected_text",
  "accessibility_stt_start",
  "accessibility_stt_result",
  "accessibility_stt_error",
  "accessibility_send_transcript_to_chat",
] as const;

export type MbkruVoiceAnalyticsEventName = (typeof MBKRU_VOICE_ANALYTICS_EVENT_NAMES)[number];

const analyticsEventNameSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.enum(MBKRU_VOICE_ANALYTICS_EVENT_NAMES),
);

export const mbkruVoiceAnalyticsBodySchema = z.object({
  name: analyticsEventNameSchema,
  payload: z.record(z.string(), z.unknown()).optional().default({}),
  token: z.string().max(5000).optional(),
});
