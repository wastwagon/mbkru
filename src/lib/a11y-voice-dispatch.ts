/** Fired to open the accessibility + voice tools panel (see `AccessibilityVoiceTools`). */
export const MBKRU_A11Y_OPEN_EVENT = "mbkru-a11y-open" as const;

/** Close only the accessibility panel (e.g. when opening MBKRU Voice). */
export const MBKRU_CLOSE_A11Y_PANEL_EVENT = "mbkru-close-accessibility-panel" as const;

/** Close only the MBKRU Voice chat dialog (e.g. when opening accessibility tools). */
export const MBKRU_CLOSE_VOICE_CHAT_EVENT = "mbkru-close-voice-chatbot" as const;

/** Open the MBKRU Voice chat panel (mobile bottom nav, CTAs). */
export const MBKRU_VOICE_OPEN_EVENT = "mbkru-voice-open" as const;

/** `{ detail: { open: boolean } }` — chat panel visibility for chrome (bottom nav highlight). */
export const MBKRU_VOICE_OPEN_CHANGE_EVENT = "mbkru-voice-open-change" as const;

export function openAccessibilityTools(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MBKRU_A11Y_OPEN_EVENT));
}

export function openVoiceChat(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MBKRU_VOICE_OPEN_EVENT));
}
