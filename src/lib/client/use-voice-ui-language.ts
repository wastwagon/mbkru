"use client";

import { useEffect, useState } from "react";

import { voiceLanguageOptions, voicePreferencesStorageKey, type VoicePreferences } from "@/lib/voice-languages";

export type VoiceUiLanguageId = VoicePreferences["languageId"];

/**
 * Reads `mbkru_voice_preferences_v1` so Citizen Voice submit UX matches MBKRU Voice / accessibility language.
 * Defaults to English until hydrated from localStorage.
 */
export function useVoiceUiLanguageId(): VoiceUiLanguageId {
  const [id, setId] = useState<VoiceUiLanguageId>("en-gh");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(voicePreferencesStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<VoicePreferences>;
      const next = parsed.languageId;
      if (next && voiceLanguageOptions.some((o) => o.id === next)) {
        setId(next);
      }
    } catch {
      // ignore
    }
  }, []);

  return id;
}
