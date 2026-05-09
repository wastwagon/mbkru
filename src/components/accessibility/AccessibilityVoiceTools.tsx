"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "@/lib/client/web-speech-recognition";
import {
  MBKRU_A11Y_OPEN_EVENT,
  MBKRU_CLOSE_A11Y_PANEL_EVENT,
  MBKRU_CLOSE_VOICE_CHAT_EVENT,
} from "@/lib/a11y-voice-dispatch";
import { trackUiEvent } from "@/lib/client/analytics-events";
import type { SpeechRecognitionCtor, SpeechRecognitionEventLike, SpeechRecognitionLike } from "@/lib/client/web-speech-recognition";
import { focusRingSmClass } from "@/lib/primary-link-styles";
import { splitTextForSpeechSynthesis } from "@/lib/client/speech-synthesis-chunks";
import {
  getAccessibilityVoiceStrings,
  getVoiceChromeStrings,
  voiceLanguageMenuLabel,
} from "@/lib/voice-ui-i18n";
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
  const [audioCaps, setAudioCaps] = useState<{ whisper: boolean; tts: boolean } | null>(null);
  const [isWhisperRecording, setIsWhisperRecording] = useState(false);
  const [isTranscribingWhisper, setIsTranscribingWhisper] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const panelWasOpenRef = useRef(false);
  const suppressWhisperUploadRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordMimeRef = useRef<string>("audio/webm");
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackObjectUrlRef = useRef<string | null>(null);

  const recognitionCtor = useMemo((): SpeechRecognitionCtor | null => {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  }, []);

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const recognitionSupported = Boolean(recognitionCtor);
  const selectedLanguage = findVoiceLanguage(preferences.languageId);
  const a11y = useMemo(() => getAccessibilityVoiceStrings(preferences.languageId), [preferences.languageId]);
  const chrome = useMemo(() => getVoiceChromeStrings(preferences.languageId), [preferences.languageId]);
  const useWhisperInput = Boolean(preferences.useOpenAiWhisperMic && audioCaps?.whisper);
  const readAloudPossible =
    speechSupported || Boolean(audioCaps?.tts && preferences.useOpenAiTtsPlayback);

  function stopOpenAiPlayback() {
    playbackAudioRef.current?.pause();
    playbackAudioRef.current = null;
    if (playbackObjectUrlRef.current) {
      URL.revokeObjectURL(playbackObjectUrlRef.current);
      playbackObjectUrlRef.current = null;
    }
  }

  function stopWhisperMediaTracks() {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
  }

  function haltAccessibilityRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      suppressWhisperUploadRef.current = true;
      try {
        mediaRecorderRef.current.stop();
      } catch {
        suppressWhisperUploadRef.current = false;
        stopWhisperMediaTracks();
      }
    } else {
      stopWhisperMediaTracks();
    }
    setIsWhisperRecording(false);
    setIsTranscribingWhisper(false);
  }

  function collapsePanelVoiceCleanup() {
    stopSpeakingInner();
    haltAccessibilityRecording();
  }

  function stopSpeakingInner() {
    stopOpenAiPlayback();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsReading(false);
  }

  function speakBrowserUtterance(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const chunks = splitTextForSpeechSynthesis(text, 320);
    if (chunks.length === 0) return;
    chunks.forEach((chunk, index) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = selectedLanguage.synthesisLang;
      utterance.rate = preferences.speechRate;
      utterance.pitch = 1;
      utterance.onstart = () => {
        if (index === 0) setIsReading(true);
      };
      utterance.onend = () => {
        if (index === chunks.length - 1) setIsReading(false);
      };
      utterance.onerror = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
    });
  }

  async function speakWithOptionalOpenAiTts(text: string) {
    if (typeof window === "undefined") return;
    stopSpeakingInner();
    const trimmed = text.trim();
    if (!trimmed.length) return;
    const preferOpenAi = preferences.useOpenAiTtsPlayback && audioCaps?.tts;
    const TTS_CHUNK = 3800;

    if (preferOpenAi) {
      setIsReading(true);
      const pieces: string[] = [];
      for (let i = 0; i < trimmed.length; i += TTS_CHUNK) {
        pieces.push(trimmed.slice(i, i + TTS_CHUNK));
      }
      try {
        for (const piece of pieces) {
          const response = await fetch("/api/mbkru-voice/speech", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: piece,
              speed: preferences.speechRate,
            }),
          });
          if (!response.ok) throw new Error("tts_failed");
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          playbackObjectUrlRef.current = url;
          const audio = new Audio(url);
          playbackAudioRef.current = audio;
          await new Promise<void>((resolve, reject) => {
            audio.addEventListener("ended", () => {
              stopOpenAiPlayback();
              resolve();
            });
            audio.addEventListener("error", () => {
              stopOpenAiPlayback();
              reject(new Error("audio_error"));
            });
            void audio.play().catch(reject);
          });
          trackUiEvent("mbkru_voice_openai_tts_play", {
            language: preferences.languageId,
            surface: "accessibility",
          });
        }
        setIsReading(false);
      } catch {
        setIsReading(false);
        stopOpenAiPlayback();
        trackUiEvent("mbkru_voice_openai_tts_fallback_browser", {
          language: preferences.languageId,
          surface: "accessibility",
        });
        if (speechSupported) speakBrowserUtterance(trimmed);
        else setLastError(a11y.errReadAloudUnavailable);
      }
    } else if (speechSupported) {
      speakBrowserUtterance(trimmed);
    } else {
      setLastError(a11y.errReadAloudNoSynth);
    }
  }

  function pickRecorderMime(): string {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
    return "";
  }

  function filenameForRecorderMime(mime: string): string {
    if (mime.includes("mp4")) return "recording.m4a";
    if (mime.includes("webm")) return "recording.webm";
    return "recording.webm";
  }

  async function toggleWhisperRecording() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setLastError(chrome.errNoMic);
      return;
    }
    if (isWhisperRecording && mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        setIsWhisperRecording(false);
        stopWhisperMediaTracks();
      }
      return;
    }

    setLastError(null);
    const mime = pickRecorderMime();
    if (!mime) {
      setLastError(chrome.errNoWhisperMime);
      trackUiEvent("mbkru_voice_whisper_transcribe_error", {
        language: preferences.languageId,
        reason: "no_mime",
        surface: "accessibility",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      recordMimeRef.current = mime;
      mediaChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setLastError(chrome.errRecordingFailed);
        trackUiEvent("mbkru_voice_whisper_transcribe_error", {
          language: preferences.languageId,
          reason: "recorder",
          surface: "accessibility",
        });
        setIsWhisperRecording(false);
        stopWhisperMediaTracks();
      };
      recorder.onstop = () => {
        void (async () => {
          const chunkParts = mediaChunksRef.current;
          mediaChunksRef.current = [];
          stopWhisperMediaTracks();
          setIsWhisperRecording(false);
          if (suppressWhisperUploadRef.current) {
            suppressWhisperUploadRef.current = false;
            return;
          }
          const blob = new Blob(chunkParts, { type: recordMimeRef.current });
          if (blob.size === 0) {
            setLastError(chrome.errNoAudio);
            trackUiEvent("mbkru_voice_whisper_transcribe_error", {
              language: preferences.languageId,
              reason: "empty",
              surface: "accessibility",
            });
            return;
          }
          setIsTranscribingWhisper(true);
          try {
            const formData = new FormData();
            formData.append("audio", blob, filenameForRecorderMime(recordMimeRef.current));
            formData.append("languageId", preferences.languageId);
            const response = await fetch("/api/mbkru-voice/transcribe", {
              method: "POST",
              body: formData,
            });
            const data = (await response.json()) as { text?: string; error?: string };
            if (!response.ok || !data.text?.trim()) {
              setLastError(
                data.error === "Too many requests" ? chrome.errTranscribeRate : chrome.errTranscribeGeneric,
              );
              trackUiEvent("mbkru_voice_whisper_transcribe_error", {
                language: preferences.languageId,
                reason: data.error ?? `http_${response.status}`,
                surface: "accessibility",
              });
              return;
            }
            const text = data.text!.trim();
            setVoiceNote((prev) => (prev ? `${prev} ${text}`.trim() : text));
            trackUiEvent("mbkru_voice_whisper_transcribe_ok", {
              language: preferences.languageId,
              surface: "accessibility",
            });
            window.dispatchEvent(
              new CustomEvent("mbkru-voice-transcript", {
                detail: { transcript: text, languageId: preferences.languageId },
              }),
            );
          } catch {
            setLastError(chrome.errTranscribeReach);
            trackUiEvent("mbkru_voice_whisper_transcribe_error", {
              language: preferences.languageId,
              reason: "network",
              surface: "accessibility",
            });
          } finally {
            setIsTranscribingWhisper(false);
          }
        })();
      };
      recorder.start(250);
      setIsWhisperRecording(true);
      trackUiEvent("mbkru_voice_whisper_record_start", {
        language: preferences.languageId,
        surface: "accessibility",
      });
    } catch {
      setLastError(chrome.errMicPermission);
      trackUiEvent("mbkru_voice_whisper_transcribe_error", {
        language: preferences.languageId,
        reason: "getusermedia",
        surface: "accessibility",
      });
      stopWhisperMediaTracks();
      setIsWhisperRecording(false);
    }
  }

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
        ...prev,
        languageId: parsed.languageId ?? prev.languageId,
        speechRate:
          typeof parsed.speechRate === "number" && parsed.speechRate >= 0.7 && parsed.speechRate <= 1.2
            ? parsed.speechRate
            : prev.speechRate,
        autoReadReplies: typeof parsed.autoReadReplies === "boolean" ? parsed.autoReadReplies : prev.autoReadReplies,
        useOpenAiWhisperMic:
          typeof parsed.useOpenAiWhisperMic === "boolean" ? parsed.useOpenAiWhisperMic : prev.useOpenAiWhisperMic,
        useOpenAiTtsPlayback:
          typeof parsed.useOpenAiTtsPlayback === "boolean" ? parsed.useOpenAiTtsPlayback : prev.useOpenAiTtsPlayback,
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
    if (!isOpen || typeof window === "undefined") return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/mbkru-voice/audio-capabilities");
        const data = (await response.json()) as { whisper?: unknown; tts?: unknown };
        if (cancelled) return;
        setAudioCaps({
          whisper: data.whisper === true,
          tts: data.tts === true,
        });
      } catch {
        if (!cancelled) setAudioCaps({ whisper: false, tts: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!audioCaps) return;
    setPreferences((p) => {
      if (audioCaps.whisper && audioCaps.tts) return p;
      const next = { ...p };
      let changed = false;
      if (!audioCaps.whisper && p.useOpenAiWhisperMic) {
        next.useOpenAiWhisperMic = false;
        changed = true;
      }
      if (!audioCaps.tts && p.useOpenAiTtsPlayback) {
        next.useOpenAiTtsPlayback = false;
        changed = true;
      }
      return changed ? next : p;
    });
  }, [audioCaps]);

  useEffect(() => {
    if (isOpen) {
      panelWasOpenRef.current = true;
      return;
    }
    if (!panelWasOpenRef.current || typeof window === "undefined") return;
    collapsePanelVoiceCleanup();
    panelWasOpenRef.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onOpen = () => {
      window.dispatchEvent(new Event(MBKRU_CLOSE_VOICE_CHAT_EVENT));
      setIsOpen(true);
    };
    window.addEventListener(MBKRU_A11Y_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(MBKRU_A11Y_OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClosePanel = () => setIsOpen(false);
    window.addEventListener(MBKRU_CLOSE_A11Y_PANEL_EVENT, onClosePanel);
    return () => window.removeEventListener(MBKRU_CLOSE_A11Y_PANEL_EVENT, onClosePanel);
  }, []);

  const focusAccessibilityTrigger = useCallback(() => {
    requestAnimationFrame(() => {
      const list = document.querySelectorAll<HTMLElement>("[data-mbkru-a11y-trigger]");
      for (const el of list) {
        if (el.offsetParent !== null) {
          el.focus();
          return;
        }
      }
    });
  }, []);

  const closeAccessibilityPanel = useCallback(() => {
    setIsOpen(false);
    focusAccessibilityTrigger();
  }, [focusAccessibilityTrigger]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAccessibilityPanel();
      }
    };
    window.addEventListener("keydown", handleKey);
    window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    });
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeAccessibilityPanel]);

  useEffect(() => {
    return () => {
      suppressWhisperUploadRef.current = true;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      stopWhisperMediaTracks();
      stopOpenAiPlayback();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function getReadableMainText(): string {
    if (typeof document === "undefined") return "";
    const root =
      document.querySelector<HTMLElement>("main#main") ?? document.querySelector<HTMLElement>("main");
    if (!root) return "";
    const text = root.innerText ?? "";
    return text.replace(/\s+/g, " ").trim();
  }

  function speakPageSummary() {
    if (typeof window === "undefined") return;
    setLastError(null);
    trackUiEvent("accessibility_read_page_summary", { language: preferences.languageId });
    const title = document.title || "MBKRU website";
    const body = getReadableMainText();
    const combined =
      body.length > 0
        ? `${a11y.ttsPagePrefix}: ${title}. ${a11y.ttsMainContentLead} ${body.slice(0, 28_000)}`
        : `${a11y.ttsPagePrefix}: ${title}. ${a11y.ttsNoMainFull}`;

    void speakWithOptionalOpenAiTts(combined);
  }

  function speakSelectedText() {
    if (typeof window === "undefined") return;
    setLastError(null);
    const selected = window.getSelection()?.toString().trim() ?? "";
    if (!selected) {
      setLastError(a11y.selectTextFirst);
      return;
    }
    trackUiEvent("accessibility_read_selected_text", { language: preferences.languageId });
    void speakWithOptionalOpenAiTts(selected.slice(0, 28_000));
  }

  function stopSpeaking() {
    stopSpeakingInner();
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
      setLastError(a11y.sttBrowserError);
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
          <p className="text-sm font-semibold text-[var(--foreground)]">{a11y.onboardingTitle}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{a11y.onboardingBody}</p>
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
            {a11y.onboardingGotIt}
          </button>
        </aside>
      ) : null}
      {isOpen ? (
        <section
          ref={panelRef}
          id="mbkru-accessibility-tools"
          className="fixed left-3 right-3 top-[4.75rem] z-[100] mx-auto mt-0 w-auto max-w-[min(30rem,calc(100vw-1.5rem))] max-h-[min(72vh,40rem)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-3.5 pb-4 shadow-xl sm:left-auto sm:right-4 sm:top-24 sm:p-4 sm:pb-4"
          aria-label={a11y.panelAria}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative pr-10">
            <p className="text-sm font-semibold text-[var(--foreground)]">{a11y.panelTitle}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{a11y.panelSubtitle}</p>
            <button
              type="button"
              onClick={closeAccessibilityPanel}
              className={`absolute right-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--section-light)] text-[var(--foreground)] hover:bg-[var(--muted)] ${focusRingSmClass}`}
              aria-label={a11y.closeAria}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-[var(--foreground)]" htmlFor="accessibility-language-select">
              {a11y.voiceLanguageLabel}
            </label>
            <select
              id="accessibility-language-select"
              value={preferences.languageId}
              onChange={(event) => updateLanguage(event.target.value as VoicePreferences["languageId"])}
              className={`h-10 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--foreground)] ${focusRingSmClass}`}
            >
              {voiceLanguageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {voiceLanguageMenuLabel(preferences.languageId, option.id)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-[var(--foreground)]" htmlFor="accessibility-rate-range">
              {a11y.speechSpeedLabel} ({preferences.speechRate.toFixed(2)}x)
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

          {audioCaps && (audioCaps.whisper || audioCaps.tts) ? (
            <div className="mt-3 flex flex-col gap-1.5 rounded-xl border border-[var(--border)]/80 bg-[var(--section-light)]/60 px-2.5 py-2 text-[11px] leading-snug text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]/90">{a11y.cloudAudioHeading}</span>
              {audioCaps.whisper ? (
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--primary)]"
                    checked={preferences.useOpenAiWhisperMic}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, useOpenAiWhisperMic: e.target.checked }))
                    }
                  />
                  <span>{a11y.whisperDictation}</span>
                </label>
              ) : null}
              {audioCaps.tts ? (
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--border)] text-[var(--primary)]"
                    checked={preferences.useOpenAiTtsPlayback}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, useOpenAiTtsPlayback: e.target.checked }))
                    }
                  />
                  <span>{a11y.openAiReadAloud}</span>
                </label>
              ) : null}
              <span className="text-[10px] opacity-90">
                {a11y.cloudFootnoteBeforePrivacy}{" "}
                <Link href="/privacy" className={`font-medium text-[var(--foreground)] ${focusRingSmClass}`}>
                  {a11y.privacyLink}
                </Link>
              </span>
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={speakPageSummary}
              disabled={!readAloudPossible || isReading || isTranscribingWhisper}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              {isReading ? a11y.reading : a11y.readMainContent}
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              disabled={!isReading}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              {a11y.stopReading}
            </button>
            <button
              type="button"
              onClick={speakSelectedText}
              disabled={!readAloudPossible || isReading || isTranscribingWhisper}
              className={`rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
            >
              {a11y.readSelected}
            </button>
            <button
              type="button"
              onClick={() => {
                if (useWhisperInput) void toggleWhisperRecording();
                else startListening();
              }}
              disabled={
                isTranscribingWhisper || (useWhisperInput ? false : isListening || !recognitionSupported)
              }
              className={`rounded-xl border border-[var(--border)] px-2.5 py-2 text-[11px] font-semibold text-[var(--foreground)] disabled:opacity-55 sm:px-3 sm:text-xs ${focusRingSmClass} ${
                useWhisperInput && isWhisperRecording ? "border-[var(--primary)]/50" : ""
              } ${useWhisperInput && isWhisperRecording ? "animate-pulse" : ""} ${!useWhisperInput && isListening ? "animate-pulse border-[var(--primary)]/50" : ""}`}
              title={
                useWhisperInput
                  ? isWhisperRecording
                    ? a11y.whisperTitleRecording
                    : a11y.whisperTitleIdle
                  : undefined
              }
            >
              {useWhisperInput
                ? isWhisperRecording
                  ? a11y.sttWhisperRecording
                  : isTranscribingWhisper
                    ? a11y.sttWhisperTranscribing
                    : a11y.sttWhisperIdle
                : isListening
                  ? a11y.sttListening
                  : a11y.sttDictate}
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-[var(--muted)] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              {a11y.transcriptLabel}
            </p>
            <p className="mt-1 min-h-8 text-sm text-[var(--foreground)]">
              {isTranscribingWhisper ? a11y.transcriptTranscribing : voiceNote || a11y.transcriptEmpty}
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
            disabled={voiceNote.trim().length === 0 || isTranscribingWhisper || isWhisperRecording}
            className={`mt-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-55 ${focusRingSmClass}`}
          >
            {a11y.sendToVoice}
          </button>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]" aria-live="polite">
            {lastError ?? a11y.footerHint}
          </p>
        </section>
      ) : null}
    </>
  );
}
