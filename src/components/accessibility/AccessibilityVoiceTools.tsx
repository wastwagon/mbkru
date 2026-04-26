"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import "@/lib/client/web-speech-recognition";
import { MBKRU_A11Y_OPEN_EVENT } from "@/lib/a11y-voice-dispatch";
import { trackUiEvent } from "@/lib/client/analytics-events";
import type { SpeechRecognitionCtor, SpeechRecognitionEventLike, SpeechRecognitionLike } from "@/lib/client/web-speech-recognition";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import {
  defaultVoicePreferences,
  findVoiceLanguage,
  voiceLanguageOptions,
  voicePreferencesStorageKey,
  type VoicePreferences,
} from "@/lib/voice-languages";

export function AccessibilityVoiceTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  const recognitionCtor = useMemo((): SpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }, []);

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported = Boolean(recognitionCtor);
  const selectedLanguage = findVoiceLanguage(preferences.languageId);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const seen = window.localStorage.getItem("mbkru_voice_onboarding_seen_v1");
      if (seen !== "true") setShowOnboarding(true);
      const raw = window.localStorage.getItem(voicePreferencesStorageKey);
      if (!raw) {
        setPrefsLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<VoicePreferences>;
      setPreferences((prev) => ({
        languageId: parsed.languageId ?? prev.languageId,
        speechRate:
          typeof parsed.speechRate === "number" && parsed.speechRate >= 0.7 && parsed.speechRate <= 1.2
            ? parsed.speechRate
            : prev.speechRate,
        autoReadReplies: typeof parsed.autoReadReplies === "boolean" ? parsed.autoReadReplies : prev.autoReadReplies,
      }));
    } catch {
      // Keep default voice preferences when storage parse fails.
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!prefsLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(voicePreferencesStorageKey, JSON.stringify(preferences));
  }, [prefsLoaded, preferences]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOpen = () => setIsOpen(true);
    window.addEventListener(MBKRU_A11Y_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(MBKRU_A11Y_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        requestAnimationFrame(() => {
          const list = document.querySelectorAll<HTMLElement>("[data-mbkru-a11y-trigger]");
          for (const el of list) {
            if (el.offsetParent !== null) {
              el.focus();
              return;
            }
          }
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    });
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  function speakPageSummary() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setLastError(null);
    trackUiEvent("accessibility_read_page_summary", { language: preferences.languageId });
    const title = document.title || "MBKRU website";
    const firstHeading = document.querySelector("h1")?.textContent?.trim();
    const summary = firstHeading
      ? `You are viewing ${title}. Main heading: ${firstHeading}.`
      : `You are viewing ${title}.`;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.lang = selectedLanguage.synthesisLang;
    utterance.rate = preferences.speechRate;
    utterance.pitch = 1;
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
  }

  function speakSelectedText() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setLastError(null);
    const selected = window.getSelection()?.toString().trim() ?? "";
    if (!selected) {
      setLastError("Select text on the page first, then use Read selected text.");
      return;
    }
    window.speechSynthesis.cancel();
    trackUiEvent("accessibility_read_selected_text", { language: preferences.languageId });
    const utterance = new SpeechSynthesisUtterance(selected.slice(0, 1600));
    utterance.lang = selectedLanguage.synthesisLang;
    utterance.rate = preferences.speechRate;
    utterance.pitch = 1;
    utterance.onstart = () => setIsReading(true);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsReading(false);
  }

  function startListening() {
    if (!recognitionCtor || typeof window === "undefined") return;
    setLastError(null);
    trackUiEvent("accessibility_stt_start", { language: preferences.languageId });
    const recognition = new recognitionCtor();
    recognition.lang = selectedLanguage.recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if ("continuous" in recognition) recognition.continuous = false;
    // Supported in newer engines; keeps speech processing on device where possible.
    if ("processLocally" in recognition) {
      (recognition as SpeechRecognitionLike & { processLocally?: boolean }).processLocally = true;
    }
    setVoiceNote("");
    setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      setVoiceNote(transcript);
      if (typeof window !== "undefined" && transcript.length > 0) {
        trackUiEvent("accessibility_stt_result", { language: preferences.languageId });
        window.dispatchEvent(
          new CustomEvent("mbkru-voice-transcript", {
            detail: { transcript, languageId: preferences.languageId },
          }),
        );
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setLastError("Speech recognition did not complete. You can continue with keyboard typing.");
      trackUiEvent("accessibility_stt_error", { language: preferences.languageId });
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function updateLanguage(languageId: VoicePreferences["languageId"]) {
    setPreferences((prev) => ({ ...prev, languageId }));
  }

  function updateSpeechRate(speechRate: number) {
    setPreferences((prev) => ({ ...prev, speechRate }));
  }

  return (
    <>
      {showOnboarding ? (
        <aside
          className="fixed left-3 right-3 top-20 z-[95] mx-auto w-auto max-w-md rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl sm:left-auto sm:right-4 sm:top-24"
          aria-label="Accessibility onboarding"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Accessibility &amp; voice</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Use the access symbol in the header (next to the menu) for read-aloud and dictation.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowOnboarding(false);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("mbkru_voice_onboarding_seen_v1", "true");
              }
            }}
            className={`mt-2 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--foreground)] ${focusRingSmClass}`}
          >
            Got it
          </button>
        </aside>
      ) : null}
      {isOpen ? (
        <section
          ref={panelRef}
          id="mbkru-accessibility-tools"
          className="fixed left-3 right-3 top-[4.75rem] z-[100] mx-auto mt-0 w-auto max-w-[22rem] max-h-[min(72vh,36rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-xl sm:left-auto sm:right-4 sm:top-24 sm:p-4"
          aria-label="Accessibility voice tools"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Voice &amp; reading</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Escape closes this panel. Dictation can be sent to MBKRU Voice.</p>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-[var(--foreground)]" htmlFor="accessibility-language-select">
              Voice language
            </label>
            <select
              id="accessibility-language-select"
              value={preferences.languageId}
              onChange={(event) => updateLanguage(event.target.value as VoicePreferences["languageId"])}
              className={`h-10 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
            >
              {voiceLanguageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-[var(--foreground)]" htmlFor="accessibility-rate-range">
              Speech speed ({preferences.speechRate.toFixed(2)}x)
            </label>
            <input
              id="accessibility-rate-range"
              type="range"
              min={0.7}
              max={1.2}
              step={0.05}
              value={preferences.speechRate}
              onChange={(event) => updateSpeechRate(Number(event.target.value))}
              className={focusRingSmClass}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={speakPageSummary}
              disabled={!speechSupported || isReading}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              {isReading ? "Reading..." : "Read page summary"}
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              disabled={!speechSupported || !isReading}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              Stop reading
            </button>
            <button
              type="button"
              onClick={speakSelectedText}
              disabled={!speechSupported}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              Read selected text
            </button>
            <button
              type="button"
              onClick={startListening}
              disabled={!recognitionSupported || isListening}
              className={`rounded-xl border border-[var(--border)] px-2.5 py-2 text-[11px] font-semibold text-[var(--foreground)] disabled:opacity-55 sm:px-3 sm:text-xs ${focusRingSmClass}`}
            >
              {isListening ? "Listening..." : "Speech to text (dictate)"}
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-[var(--muted)] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">Transcript</p>
            <p className="mt-1 min-h-8 text-sm text-[var(--foreground)]">
              {voiceNote || "Your captured speech will appear here."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && voiceNote.trim().length > 0) {
                trackUiEvent("accessibility_send_transcript_to_chat", { language: preferences.languageId });
                window.dispatchEvent(
                  new CustomEvent("mbkru-voice-transcript", {
                    detail: { transcript: voiceNote.trim(), languageId: preferences.languageId },
                  }),
                );
              }
            }}
            disabled={voiceNote.trim().length === 0}
            className={`mt-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
          >
            Send transcript to MBKRU Voice
          </button>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]" aria-live="polite">
            {lastError ??
              "If voice is unavailable, use the keyboard and regular forms. Language packs vary by device."}
          </p>
        </section>
      ) : null}
    </>
  );
}
