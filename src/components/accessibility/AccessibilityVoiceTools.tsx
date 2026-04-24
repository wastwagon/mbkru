"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { trackUiEvent } from "@/lib/client/analytics-events";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import {
  defaultVoicePreferences,
  findVoiceLanguage,
  voiceLanguageOptions,
  voicePreferencesStorageKey,
  type VoicePreferences,
} from "@/lib/voice-languages";

declare global {
  interface Window {
    webkitSpeechRecognition?: {
      new (): SpeechRecognition;
    };
  }
}

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
  const openButtonRef = useRef<HTMLButtonElement | null>(null);

  const recognitionCtor = useMemo(() => {
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
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
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
      (recognition as SpeechRecognition & { processLocally?: boolean }).processLocally = true;
    }
    setVoiceNote("");
    setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom)+0.5rem)] left-3 z-40 sm:bottom-8 sm:left-8">
      {showOnboarding ? (
        <aside
          className="mb-2 w-[min(22rem,92vw)] rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl"
          aria-label="Accessibility onboarding"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Accessibility & Voice Help</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Use this icon for text-to-speech, speech-to-text, and local language voice support.
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
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--section-dark)] text-white shadow-lg transition hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
        aria-expanded={isOpen}
        aria-controls="mbkru-accessibility-tools"
        aria-label={isOpen ? "Close accessibility tools" : "Open accessibility tools"}
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
          <circle cx="12" cy="4.75" r="1.85" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.3 9.2h13.4M12 8.2v11.4M8.8 19.6l3.2-5.2 3.2 5.2M8.6 9.2l1.6 4.1M15.4 9.2l-1.6 4.1" />
        </svg>
        <span className="sr-only">Accessibility tools</span>
      </button>

      {isOpen ? (
        <section
          ref={panelRef}
          id="mbkru-accessibility-tools"
          className="mt-3 w-[min(22rem,92vw)] max-h-[min(72vh,34rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-3.5 shadow-xl sm:p-4"
          aria-label="Accessibility voice tools"
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">Text and voice support</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Use read-aloud for page context, and speech-to-text for quick dictation. Press Escape to close this panel.
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            For speech users: after dictation, use the send button to pass transcript directly into MBKRU Voice chat.
          </p>

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
              "If voice features are unavailable in your browser, all actions remain fully available via keyboard and standard forms. Some local language voice engines depend on device/browser support."}
          </p>
        </section>
      ) : null}
    </div>
  );
}
