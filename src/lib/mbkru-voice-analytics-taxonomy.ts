/**
 * Single source for MBKRU Voice + accessibility UI telemetry event names and admin copy.
 * Ingestion allowlist: `mbkruVoiceAnalyticsBodySchema` in `@/lib/validation/mbkru-voice`.
 */

export const MBKRU_VOICE_ANALYTICS_TAXONOMY = [
  {
    name: "mbkru_voice_open_launcher",
    meaning: "User opens chatbot launcher",
    signal: "Top-of-funnel engagement",
  },
  {
    name: "mbkru_voice_send",
    meaning: "User sends a chatbot message",
    signal: "Active conversation intent",
  },
  {
    name: "mbkru_voice_reply_received",
    meaning: "Assistant response received",
    signal: "source (provider, fallback, safety…); site_context; web_search_used; safety_reason",
  },
  {
    name: "mbkru_voice_mic_start",
    meaning: "User starts chat microphone input",
    signal: "Voice-first interaction",
  },
  {
    name: "mbkru_voice_mic_error",
    meaning: "Chat microphone failed/interrupted",
    signal: "Speech UX friction and support need",
  },
  {
    name: "mbkru_voice_clear_chat",
    meaning: "User cleared the chat transcript",
    signal: "Session reset / privacy-sensitive behavior",
  },
  {
    name: "accessibility_read_page_summary",
    meaning: "Accessibility panel read-page action",
    signal: "Text-to-speech usage",
  },
  {
    name: "accessibility_read_selected_text",
    meaning: "Accessibility panel read-selection action",
    signal: "Long-form reading assist usage",
  },
  {
    name: "accessibility_stt_start",
    meaning: "Speech-to-text capture started",
    signal: "Accessibility voice input demand",
  },
  {
    name: "accessibility_stt_result",
    meaning: "Speech-to-text produced text",
    signal: "Successful assistive capture",
  },
  {
    name: "accessibility_stt_error",
    meaning: "Speech-to-text failed/interrupted",
    signal: "Browser/device capability gaps",
  },
  {
    name: "accessibility_send_transcript_to_chat",
    meaning: "Transcript handed to chatbot",
    signal: "Assistive-to-chat workflow success",
  },
] as const;

export type MbkruVoiceAnalyticsEventName = (typeof MBKRU_VOICE_ANALYTICS_TAXONOMY)[number]["name"];

export const MBKRU_VOICE_ANALYTICS_EVENT_NAMES = MBKRU_VOICE_ANALYTICS_TAXONOMY.map(
  (e) => e.name,
) as readonly MbkruVoiceAnalyticsEventName[];

const NAME_SET = new Set<string>(MBKRU_VOICE_ANALYTICS_EVENT_NAMES);

export function isMbkruVoiceAnalyticsEventName(value: string): value is MbkruVoiceAnalyticsEventName {
  return NAME_SET.has(value);
}
