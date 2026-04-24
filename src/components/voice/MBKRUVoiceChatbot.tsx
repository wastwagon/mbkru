"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import "@/lib/client/web-speech-recognition";
import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";
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

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  links?: Array<{ label: string; href: string }>;
  languageId?: VoicePreferences["languageId"];
};

const quickPromptsByLanguage: Record<
  VoicePreferences["languageId"],
  Array<{ label: string; prompt: string }>
> = {
  "en-gh": [
    { label: "Track my report", prompt: "Help me track my report status." },
    { label: "Start a petition", prompt: "How do I start a new petition?" },
    { label: "Contact support", prompt: "How can I contact MBKRU support?" },
  ],
  twi: [
    { label: "Track report", prompt: "Boa me ma menhwe me report no status." },
    { label: "Start petition", prompt: "Mɛyɛ dɛn ahyɛ petition foforo ase?" },
    { label: "Support", prompt: "Mɛyɛ dɛn akasa akyerɛ MBKRU support?" },
  ],
  ga: [
    { label: "Track report", prompt: "Nyɛ mi boi ni mi kɛ mi report status." },
    { label: "Start petition", prompt: "Mitsɛ ni maba petition tsui?" },
    { label: "Support", prompt: "Mitsɛ ni mika MBKRU support hewalɛ?" },
  ],
  hausa: [
    { label: "Track report", prompt: "Taimaka min duba matsayin rahotona." },
    { label: "Start petition", prompt: "Ta yaya zan fara sabon petition?" },
    { label: "Support", prompt: "Ta yaya zan tuntubi MBKRU support?" },
  ],
  ewe: [
    { label: "Track report", prompt: "Kpe ɖe ŋunye be maƒo report status." },
    { label: "Start petition", prompt: "Aleke maɖe petition yeye gɔme?" },
    { label: "Support", prompt: "Aleke maate ŋu akpa nu kple MBKRU support?" },
  ],
};

const helperTextByLanguage: Record<VoicePreferences["languageId"], string> = {
  "en-gh": "Tip: You can type, use Mic, or send transcript from Accessibility Tools.",
  twi: "Afotuo: Wubetumi akyerɛw, de Mic adi dwuma, anaasɛ wode transcript bɛma chat no.",
  ga: "Kpee: Osha nyɛŋ, lɛ Mic kɛ, alo lɛ transcript shi Accessibility Tools kɛ.",
  hausa: "Shawara: Za ka iya rubutu, amfani da Mic, ko tura transcript daga Accessibility Tools.",
  ewe: "Tadede: Àte ŋu aŋlɔ nu, azã Mic, alo aɖo transcript ɖa tso Accessibility Tools me.",
};

const introMessage: ChatEntry = {
  role: "assistant",
  content:
    "Hello, I am MBKRU Voice. I am always online to help with support, reports, petitions, and accountability tools. How can I help you today?",
  languageId: "en-gh",
};

const languageBadgeLabel: Record<VoicePreferences["languageId"], string> = {
  "en-gh": "EN",
  twi: "TWI",
  ga: "GA",
  hausa: "HAUSA",
  ewe: "EWE",
};

export function MBKRUVoiceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([introMessage]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const historyForApi = useMemo(
    () => messages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content })),
    [messages],
  );
  const selectedLanguage = findVoiceLanguage(preferences.languageId);
  const recognitionCtor: SpeechRecognitionCtor | null =
    typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
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
      // Keep defaults when reading preferences fails.
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        openButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function startListeningForChat() {
    if (!recognitionCtor || typeof window === "undefined") return;
    setListeningError(null);
    trackUiEvent("mbkru_voice_mic_start", { language: preferences.languageId });
    const recognition = new recognitionCtor();
    recognition.lang = selectedLanguage.recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    if ("continuous" in recognition) recognition.continuous = false;
    if ("processLocally" in recognition) {
      (recognition as SpeechRecognitionLike & { processLocally?: boolean }).processLocally = true;
    }
    setIsListening(true);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (transcript.length > 0) setInput(transcript);
    };
    recognition.onerror = () => {
      setListeningError("Microphone capture was interrupted. You can still type your message.");
      trackUiEvent("mbkru_voice_mic_error", { language: preferences.languageId });
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  useEffect(() => {
    if (!prefsLoaded || typeof window === "undefined") return;
    window.localStorage.setItem(voicePreferencesStorageKey, JSON.stringify(preferences));
  }, [prefsLoaded, preferences]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ transcript?: string }>;
      const transcript = customEvent.detail?.transcript?.trim();
      if (!transcript) return;
      setInput(transcript);
      setIsOpen(true);
    };
    window.addEventListener("mbkru-voice-transcript", handler as EventListener);
    return () => window.removeEventListener("mbkru-voice-transcript", handler as EventListener);
  }, []);

  function speakAssistantReply(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage.synthesisLang;
    utterance.rate = preferences.speechRate;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextUser: ChatEntry = { role: "user", content: trimmed };
    const currentHistory = [...messages, nextUser];
    setMessages(currentHistory);
    setInput("");
    setIsLoading(true);
    trackUiEvent("mbkru_voice_send", { language: preferences.languageId });

    try {
      const response = await fetch("/api/mbkru-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          languageId: preferences.languageId,
        }),
      });

      if (!response.ok) throw new Error("MBKRU Voice request failed");
      const data = (await response.json()) as {
        answer?: string;
        suggestedLinks?: Array<{ label: string; href: string }>;
        source?: string;
        safetyReason?: string;
      };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer?.trim() || "I could not generate a response right now.",
          links: data.suggestedLinks ?? [],
          languageId: preferences.languageId,
        },
      ]);
      if (preferences.autoReadReplies) {
        speakAssistantReply(data.answer?.trim() || "I could not generate a response right now.");
      }
      trackUiEvent("mbkru_voice_reply_received", {
        language: preferences.languageId,
        source: data.source ?? "unknown",
        safety_reason: data.safetyReason ?? null,
      });
    } catch {
      const fallback = getMbkruVoiceFallbackReply(trimmed, preferences.languageId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallback.answer,
          links: fallback.suggestedLinks,
          languageId: preferences.languageId,
        },
      ]);
      if (preferences.autoReadReplies) {
        speakAssistantReply(fallback.answer);
      }
      trackUiEvent("mbkru_voice_reply_received", { language: preferences.languageId, source: "client-fallback" });
    } finally {
      setIsLoading(false);
    }
  }

  function applyQuickPrompt(prompt: string) {
    setInput(prompt);
  }

  function clearConversation() {
    setMessages([introMessage]);
    setInput("");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    trackUiEvent("mbkru_voice_clear_chat", { language: preferences.languageId });
  }

  return (
    <div className="fixed bottom-[max(6.5rem,env(safe-area-inset-bottom)+5rem)] right-3 z-40 sm:bottom-8 sm:right-8">
      {isOpen ? (
        <section
          className="w-[min(23rem,94vw)] max-h-[min(78vh,42rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
          aria-label="MBKRU Voice chatbot"
          role="dialog"
          aria-modal="false"
        >
          <header className="flex items-center justify-between gap-3 bg-[var(--primary)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">MBKRU Voice</p>
              <p className="text-xs text-white/90">Always online customer service agent</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="mbkru-voice-lang" className="sr-only">
                Chat language
              </label>
              <select
                id="mbkru-voice-lang"
                value={preferences.languageId}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    languageId: event.target.value as VoicePreferences["languageId"],
                  }))
                }
                className={`h-8 max-w-28 rounded-md border border-white/40 bg-transparent px-1.5 text-[11px] font-semibold text-white ${focusRingSmClass}`}
                aria-label="Chat language"
              >
                {voiceLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id} className="text-black">
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, autoReadReplies: !prev.autoReadReplies }))}
                className={`rounded-md border border-white/40 px-2 py-1 text-[11px] font-semibold text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
                aria-pressed={preferences.autoReadReplies}
              >
                {preferences.autoReadReplies ? "Read replies: On" : "Read replies: Off"}
              </button>
              <button
                type="button"
                onClick={clearConversation}
                className={`rounded-md border border-white/40 px-2 py-1 text-[11px] font-semibold text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`rounded-md px-2 py-1 text-xs font-semibold text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
              >
                Close
              </button>
            </div>
          </header>

          <div className="max-h-[min(52vh,22rem)] space-y-3 overflow-y-auto bg-[var(--section-light)] p-3.5 sm:p-4" aria-live="polite">
            <div className="flex flex-wrap gap-2">
              {quickPromptsByLanguage[preferences.languageId].map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => applyQuickPrompt(entry.prompt)}
                  className={`rounded-lg border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] ${focusRingSmClass}`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-[var(--primary)] text-white"
                    : "border border-[var(--border)] bg-white text-[var(--foreground)]"
                }`}
              >
                <p>{message.content}</p>
                {message.role === "assistant" && message.links && message.links.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`rounded-lg border border-[var(--border)] bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] ${focusRingSmClass}`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" ? (
                  <p className="mt-2 inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--muted-foreground)]">
                    {languageBadgeLabel[message.languageId ?? "en-gh"]}
                  </p>
                ) : null}
              </article>
            ))}
            {isLoading ? (
              <p className="text-xs font-medium text-[var(--muted-foreground)]" role="status">
                MBKRU Voice is typing...
              </p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-[var(--border)] bg-white p-2.5 sm:p-3">
            <p className="mb-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
              MBKRU Voice uses AI-assisted responses and accessibility telemetry for service quality. Do not share highly
              sensitive personal data.{" "}
              <Link href="/privacy" className={focusRingSmClass}>
                Privacy policy
              </Link>
              .
            </p>
            <label htmlFor="mbkru-voice-input" className="sr-only">
              Ask MBKRU Voice
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={startListeningForChat}
                disabled={isListening || !recognitionCtor}
                className={`h-11 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-2.5 text-[11px] font-semibold text-[var(--foreground)] disabled:opacity-55 sm:px-3 sm:text-xs ${focusRingSmClass}`}
                aria-label={isListening ? "Listening to microphone input" : "Use microphone voice input"}
              >
                {isListening ? "Listening..." : "Mic"}
              </button>
              <input
                ref={inputRef}
                id="mbkru-voice-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about reports, petitions, and support..."
                className={`h-11 w-full min-w-0 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] ${focusRingSmClass}`}
                maxLength={300}
              />
              <button
                type="submit"
                disabled={isLoading || input.trim().length === 0}
                className={`h-11 shrink-0 rounded-xl bg-[var(--primary)] px-3 text-sm font-semibold text-white disabled:opacity-55 sm:px-4 ${focusRingSmClass}`}
              >
                Send
              </button>
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{helperTextByLanguage[preferences.languageId]}</p>
            {listeningError ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]" role="status">
                {listeningError}
              </p>
            ) : null}
          </form>
        </section>
      ) : (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          onMouseDown={() => trackUiEvent("mbkru_voice_open_launcher")}
          className={`rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
          aria-label="Open MBKRU Voice chatbot"
        >
          MBKRU Voice
        </button>
      )}
    </div>
  );
}
