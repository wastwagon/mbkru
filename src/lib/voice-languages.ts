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
};

export const defaultVoicePreferences: VoicePreferences = {
  languageId: "en-gh",
  speechRate: 0.96,
  autoReadReplies: true,
};

export function findVoiceLanguage(languageId: VoiceLanguageOption["id"]): VoiceLanguageOption {
  return voiceLanguageOptions.find((option) => option.id === languageId) ?? voiceLanguageOptions[0];
}
