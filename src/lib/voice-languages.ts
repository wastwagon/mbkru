export type VoiceLanguageOption = {
  id: "en-gh" | "twi" | "ga" | "hausa" | "ewe";
  label: string;
  recognitionLang: string;
  synthesisLang: string;
};

export const voiceLanguageOptions: VoiceLanguageOption[] = [
  {
    id: "en-gh",
    label: "English (Ghana)",
    recognitionLang: "en-GH",
    synthesisLang: "en-GH",
  },
  {
    id: "twi",
    label: "Twi (Akan)",
    recognitionLang: "ak-GH",
    synthesisLang: "ak-GH",
  },
  {
    id: "ga",
    label: "Ga",
    recognitionLang: "gaa-GH",
    synthesisLang: "gaa-GH",
  },
  {
    id: "hausa",
    label: "Hausa",
    recognitionLang: "ha-GH",
    synthesisLang: "ha-GH",
  },
  {
    id: "ewe",
    label: "Ewe",
    recognitionLang: "ee-GH",
    synthesisLang: "ee-GH",
  },
];

export const voicePreferencesStorageKey = "mbkru_voice_preferences_v1";

export type VoicePreferences = {
  languageId: VoiceLanguageOption["id"];
  speechRate: number;
  autoReadReplies: boolean;
  /** Record mic audio on-device, transcribe via OpenAI Whisper on the server. */
  useOpenAiWhisperMic: boolean;
  /** Prefer OpenAI TTS for assistant read-aloud (falls back to browser speech when unsupported). */
  useOpenAiTtsPlayback: boolean;
};

export const defaultVoicePreferences: VoicePreferences = {
  languageId: "en-gh",
  speechRate: 0.96,
  autoReadReplies: true,
  useOpenAiWhisperMic: false,
  useOpenAiTtsPlayback: false,
};

export function findVoiceLanguage(languageId: VoiceLanguageOption["id"]): VoiceLanguageOption {
  return voiceLanguageOptions.find((option) => option.id === languageId) ?? voiceLanguageOptions[0];
}
