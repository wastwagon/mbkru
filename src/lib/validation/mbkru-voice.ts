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
  content: z.string().max(2000),
});

export const mbkruVoiceChatBodySchema = z.object({
  message: z.string().trim().min(1).max(4000),
  languageId: mbkruVoiceLanguageIdSchema.optional(),
  history: z.array(chatTurnSchema).max(24).optional(),
  /**
   * Optional `data:image/...;base64,...` from the current turn only. Size-capped in refine.
   * Omitted in chat history; server sends to vision-capable model.
   */
  imageBase64: z.string().optional(),
  /** Plain text from a user-selected .txt (current turn) */
  fileText: z.string().max(48_000).optional(),
  fileName: z.string().max(220).optional(),
  /**
   * Base64 PDF bytes (raw or `data:application/pdf;base64,...`). Parsed server-side with `pdf-parse`.
   */
  pdfBase64: z.string().max(1_800_000).optional(),
  /** When true, server fetches real-time web context (requires `TAVILY_API_KEY`). */
  webSearch: z.boolean().optional().default(true),
})
  .refine(
    (data) => {
      if (!data.imageBase64) return true;
      return data.imageBase64.length <= 2_200_000;
    },
    { message: "imageBase64 too large" },
  )
  .refine(
    (data) => {
      if (!data.pdfBase64) return true;
      return data.pdfBase64.length <= 1_800_000;
    },
    { message: "pdfBase64 too large" },
  );

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
