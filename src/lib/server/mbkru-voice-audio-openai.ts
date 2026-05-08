import "server-only";

import type { VoicePreferences } from "@/lib/voice-languages";

const WHISPER_MODEL = "whisper-1" as const;
const TTS_MODEL_DEFAULT = process.env.OPENAI_TTS_MODEL?.trim() || "tts-1";

/** Optional ISO 639-1 hint for Whisper; omit when unknown to rely on detection. */
export function whisperLanguageHint(languageId: VoicePreferences["languageId"]): string | undefined {
  switch (languageId) {
    case "en-gh":
      return "en";
    case "twi":
      return "ak";
    case "hausa":
      return "ha";
    case "ewe":
      return "ee";
    default:
      return undefined;
  }
}

export async function whisperTranscribeFromBuffer(args: {
  apiKey: string;
  buffer: Buffer;
  mimeType: string | null;
  languageHint?: string;
  filenameFallback: string;
}): Promise<{ text: string } | null> {
  const extGuess = mimeToExtension(args.mimeType);
  const filename = args.filenameFallback.includes(".") ? args.filenameFallback : `audio.${extGuess}`;

  const formData = new FormData();
  const bytes = Uint8Array.from(args.buffer);
  const blob = new Blob([bytes], { type: args.mimeType ?? "application/octet-stream" });
  formData.append("file", blob, filename);
  formData.append("model", WHISPER_MODEL);
  if (args.languageHint?.length === 2) {
    formData.append("language", args.languageHint);
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { text?: string };
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text.length) return null;
  return { text };
}

export type OpenAiTtsVoice =
  | "alloy"
  | "echo"
  | "fable"
  | "onyx"
  | "nova"
  | "shimmer";

export const OPENAI_VOICES_LIST = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

const envVoiceRaw = process.env.OPENAI_TTS_VOICE?.trim().toLowerCase() ?? "";
const DEFAULT_TTS_VOICE: OpenAiTtsVoice =
  OPENAI_VOICES_LIST.includes(envVoiceRaw as OpenAiTtsVoice) ? (envVoiceRaw as OpenAiTtsVoice) : "nova";

export function normalizeOpenAiTtsVoice(raw: string | undefined | null): OpenAiTtsVoice {
  const v = (raw ?? "").trim().toLowerCase();
  return OPENAI_VOICES_LIST.includes(v as OpenAiTtsVoice) ? (v as OpenAiTtsVoice) : DEFAULT_TTS_VOICE;
}

/** Returns MP3 binary on success (`response_format`: mp3). */
export async function openAiSpeechSynthesize(args: {
  apiKey: string;
  text: string;
  voice?: OpenAiTtsVoice;
  speed?: number;
  model?: string;
}): Promise<Buffer | null> {
  const model = args.model?.trim() || TTS_MODEL_DEFAULT;
  const voice =
    args.voice != null && OPENAI_VOICES_LIST.includes(args.voice) ? args.voice : DEFAULT_TTS_VOICE;
  const speed = clampSpeed(args.speed);

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model,
      voice,
      input: args.text,
      response_format: "mp3",
      speed,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

function clampSpeed(rate: number | undefined): number {
  const n = typeof rate === "number" && Number.isFinite(rate) ? rate : 1;
  const out = Math.min(1.2, Math.max(0.7, n));
  return Math.round(out * 1000) / 1000;
}

function mimeToExtension(mimeType: string | null): string {
  const m = (mimeType ?? "").split(";")[0]?.trim().toLowerCase();
  if (m === "audio/webm" || m === "audio/webm;codecs=opus") return "webm";
  if (m === "audio/mp4" || m === "audio/m4a" || m === "audio/x-m4a") return "m4a";
  if (m === "audio/mp3" || m === "audio/mpeg") return "mp3";
  if (m === "audio/wav" || m === "audio/x-wav" || m === "audio/wave") return "wav";
  if (m === "audio/ogg" || m === "audio/ogg;codecs=opus") return "ogg";
  return "webm";
}
