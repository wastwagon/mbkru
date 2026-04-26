"use client";

import Link from "next/link";
import { type ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

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
    { label: "Track report", prompt: "Help me track my report status." },
    { label: "Petition", prompt: "How do I start a new petition?" },
    { label: "Contact", prompt: "How can I contact MBKRU support?" },
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
  "en-gh": "Type, use the mic or image icons, or the access icon in the header for more voice options.",
  twi: "Wubetumi akyerɛw, Mic, anaasɛ a access icon a header mu.",
  ga: "Kpee: Osha nyɛŋ, Mic, alo access icon header ni.",
  hausa: "Rubutu, mic, ko alamar dama a cikin header don ƙarin ayyukan murya.",
  ewe: "Aŋlɔ nu, Mic, alo access icon a header la.",
};

const introMessage: ChatEntry = {
  role: "assistant",
  content: "Hello. How can I help today?",
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
  const [imageAttachment, setImageAttachment] = useState<{ previewUrl: string; name: string } | null>(null);
  const [textFileAttachment, setTextFileAttachment] = useState<{ name: string; text: string } | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);
  const pendingImageFileRef = useRef<File | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
    return () => {
      if (imageAttachment?.previewUrl) URL.revokeObjectURL(imageAttachment.previewUrl);
    };
  }, [imageAttachment?.previewUrl]);

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
      setListeningError("Mic interrupted. You can type instead.");
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

  const MAX_IMAGE_BYTES = 1.25 * 1024 * 1024; // keep JSON body within typical limits
  const MAX_TEXT_FILE_CHARS = 40_000;

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject());
      r.onerror = () => reject();
      r.readAsDataURL(file);
    });
  }

  function onAttachmentFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAttachmentNotice(null);
    if (!file) return;
    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_BYTES) {
        setAttachmentNotice("Images must be about 1.25 MB or smaller for the AI to accept them.");
        return;
      }
      setTextFileAttachment(null);
      pendingImageFileRef.current = file;
      setImageAttachment((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { name: file.name, previewUrl: URL.createObjectURL(file) };
      });
      return;
    }
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      if (file.size > MAX_TEXT_FILE_CHARS) {
        setAttachmentNotice("Text file is too large — try a smaller .txt (under 40,000 characters).");
        return;
      }
      pendingImageFileRef.current = null;
      if (imageAttachment?.previewUrl) {
        URL.revokeObjectURL(imageAttachment.previewUrl);
        setImageAttachment(null);
      }
      const r = new FileReader();
      r.onload = () => {
        const t = (typeof r.result === "string" ? r.result : "").slice(0, MAX_TEXT_FILE_CHARS);
        setTextFileAttachment({ name: file.name, text: t });
      };
      r.readAsText(file);
      return;
    }
    setAttachmentNotice("Use an image (JPEG, PNG, etc.) or a .txt file.");
  }

  function clearAttachments() {
    pendingImageFileRef.current = null;
    setTextFileAttachment(null);
    setImageAttachment((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setAttachmentNotice(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    const trimmed = input.trim();
    const hasImage = Boolean(pendingImageFileRef.current && imageAttachment);
    const hasTextFile = Boolean(textFileAttachment?.text);
    if (!trimmed && !hasImage && !hasTextFile) return;

    const linePhoto = hasImage && imageAttachment ? `[Photo: ${imageAttachment.name}]` : "";
    const lineFile = hasTextFile && textFileAttachment ? `[File: ${textFileAttachment.name}]` : "";
    const combined = [linePhoto, lineFile, trimmed].filter(Boolean).join("\n").trim() || "Help with my attachment(s).";
    const apiText =
      trimmed ||
      (hasTextFile && hasImage
        ? "Use the image and the attached file as context."
        : hasImage
          ? "Describe what is in the image. Relate to MBKRU, Ghana, or public accountability if relevant."
          : hasTextFile
            ? "Read and use the attached text. Summarise or answer my question in context."
            : "");

    let imageBase64: string | undefined;
    if (pendingImageFileRef.current) {
      try {
        imageBase64 = await readFileAsDataUrl(pendingImageFileRef.current);
      } catch {
        setAttachmentNotice("Could not read the image. Try a smaller file.");
        return;
      }
    }

    const fileTextForApi = textFileAttachment?.text;
    const fileNameForApi = textFileAttachment?.name;

    const nextUser: ChatEntry = { role: "user", content: combined };
    const currentHistory = [...messages, nextUser];
    setMessages(currentHistory);
    setInput("");
    clearAttachments();
    setIsLoading(true);
    trackUiEvent("mbkru_voice_send", { language: preferences.languageId });

    try {
      const response = await fetch("/api/mbkru-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: apiText.slice(0, 4000),
          history: historyForApi,
          languageId: preferences.languageId,
          imageBase64,
          fileText: fileTextForApi,
          fileName: fileNameForApi,
          webSearch: useWebSearch,
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
      const fallback = getMbkruVoiceFallbackReply(combined, preferences.languageId);
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
    clearAttachments();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    trackUiEvent("mbkru_voice_clear_chat", { language: preferences.languageId });
  }

  return (
    <>
      {isOpen ? (
        <section
          className="w-[min(22rem,94vw)] max-h-[min(78vh,42rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
          aria-label="MBKRU Voice chatbot"
          role="dialog"
          aria-modal="false"
        >
          <header className="relative border-b border-white/10 bg-[var(--primary)] px-3 py-2.5 pr-11 text-white sm:px-3.5 sm:pr-12 sm:py-2.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-1.5">
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
                className={`h-8 max-w-[9.5rem] rounded-md border border-white/40 bg-white/10 px-1.5 text-[11px] font-medium text-white ${focusRingSmClass}`}
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
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/40 text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
                aria-pressed={preferences.autoReadReplies}
                title={preferences.autoReadReplies ? "Read-aloud is on" : "Read-aloud is off"}
                aria-label={preferences.autoReadReplies ? "Read assistant replies aloud: on" : "Read assistant replies aloud: off"}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={clearConversation}
                className={`rounded-md border border-white/40 px-2 py-1 text-[11px] font-semibold text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
              >
                Clear
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 ${focusRingSmClass}`}
              aria-label="Close chat"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                Thinking…
              </p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-[var(--border)] bg-white p-2.5 sm:p-3">
            <p className="mb-2 text-[10px] leading-snug text-[var(--muted-foreground)]">
              AI-assisted. Avoid highly sensitive data.{" "}
              <Link href="/privacy" className={focusRingSmClass}>
                Privacy
              </Link>
            </p>
            <label htmlFor="mbkru-voice-input" className="sr-only">
              Ask MBKRU Voice
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,.txt,text/plain"
              className="sr-only"
              onChange={onAttachmentFileChange}
            />
            {imageAttachment ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageAttachment.previewUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-[var(--foreground)]">{imageAttachment.name}</span>
                <button
                  type="button"
                  onClick={clearAttachments}
                  className={`shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--foreground)] ${focusRingSmClass}`}
                >
                  Remove
                </button>
              </div>
            ) : null}
            {textFileAttachment ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-2 text-xs text-[var(--foreground)]">
                <span className="line-clamp-2 min-w-0 flex-1" title={textFileAttachment.name}>
                  {textFileAttachment.name} — {textFileAttachment.text.length.toLocaleString()} characters
                </span>
                <button
                  type="button"
                  onClick={clearAttachments}
                  className={`shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold ${focusRingSmClass}`}
                >
                  Remove
                </button>
              </div>
            ) : null}
            {attachmentNotice ? (
              <p className="mb-2 text-xs text-amber-800" role="status">
                {attachmentNotice}
              </p>
            ) : null}
            <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
              <input
                ref={inputRef}
                id="mbkru-voice-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question…"
                className={`h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] ${focusRingSmClass}`}
                maxLength={2000}
              />
              <button
                type="button"
                onClick={startListeningForChat}
                disabled={isListening || !recognitionCtor}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] disabled:opacity-45 ${focusRingSmClass} ${isListening ? "animate-pulse border-[var(--primary)]/40" : ""}`}
                aria-label={isListening ? "Listening to microphone input" : "Use microphone voice input"}
                title={isListening ? "Listening…" : "Voice input"}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11v1a7 7 0 01-14 0v-1M12 18v4M8 22h8" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] ${focusRingSmClass}`}
                aria-label="Attach image or text file"
                title="Photo or .txt"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imageAttachment && !textFileAttachment)}
                className={`h-11 shrink-0 rounded-xl bg-[var(--primary)] px-3 text-sm font-semibold text-white disabled:opacity-55 sm:px-4 ${focusRingSmClass}`}
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                  checked={useWebSearch}
                  onChange={(e) => setUseWebSearch(e.target.checked)}
                />
                <span>Search the web (live) when supported</span>
              </label>
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
          className={`shrink-0 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
          aria-label="Open MBKRU Voice chatbot"
        >
          MBKRU Voice
        </button>
      )}
    </>
  );
}
