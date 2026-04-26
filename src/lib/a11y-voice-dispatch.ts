/** Fired to open the accessibility + voice tools panel (see `AccessibilityVoiceTools`). */
export const MBKRU_A11Y_OPEN_EVENT = "mbkru-a11y-open" as const;

export function openAccessibilityTools(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MBKRU_A11Y_OPEN_EVENT));
}
