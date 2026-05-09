"use client";

import Link from "next/link";
import { type ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

import "@/lib/client/web-speech-recognition";
import { MBKRU_CLOSE_A11Y_PANEL_EVENT, MBKRU_CLOSE_VOICE_CHAT_EVENT } from "@/lib/a11y-voice-dispatch";
import { splitTextForSpeechSynthesis } from "@/lib/client/speech-synthesis-chunks";
import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";
import { trackUiEvent } from "@/lib/client/analytics-events";
import type { SpeechRecognitionCtor, SpeechRecognitionEventLike, SpeechRecognitionLike } from "@/lib/client/web-speech-recognition";
import { focusRingSmClass, primaryLinkClass } from "@/lib/primary-link-styles";
import {
  defaultVoicePreferences,
  findVoiceLanguage,
  voiceLanguageOptions,
  voicePreferencesStorageKey,
  type VoicePreferences,
} from "@/lib/voice-languages";
import { getVoiceChromeStrings, voiceLanguageMenuLabel, voiceUiDateLocale } from "@/lib/voice-ui-i18n";

/** Provenance and when the turn was received (client clock). Assistant messages only. */
type MbkruVoiceAssistantMeta = {
  answeredAt: string;
  sitePagePaths?: string[];
  webSearchUsed?: boolean;
};

type ChatEntry = {
  role: "user" | "assistant";
  content: string;
  links?: Array<{ label: string; href: string }>;
  languageId?: VoicePreferences["languageId"];
  meta?: MbkruVoiceAssistantMeta;
};

export function MBKRUVoiceChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>(() => [
    {
      role: "assistant",
      content: getVoiceChromeStrings("en-gh").chatIntro,
      languageId: "en-gh",
    },
  ]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [preferences, setPreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [isListening, setIsListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | null>(null);
  const [audioCaps, setAudioCaps] = useState<{ whisper: boolean; tts: boolean } | null>(null);
  const [isWhisperRecording, setIsWhisperRecording] = useState(false);
  const [isTranscribingWhisper, setIsTranscribingWhisper] = useState(false);
  const [imageAttachment, setImageAttachment] = useState<{ previewUrl: string; name: string } | null>(null);
  const [textFileAttachment, setTextFileAttachment] = useState<{ name: string; text: string } | null>(null);
  const [pdfAttachment, setPdfAttachment] = useState<{ name: string } | null>(null);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const [attachmentNotice, setAttachmentNotice] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<BlobPart[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordMimeRef = useRef<string>("audio/webm");
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const playbackObjectUrlRef = useRef<string | null>(null);

  const suppressWhisperUploadRef = useRef(false);
  const pendingImageFileRef = useRef<File | null>(null);
  const pendingPdfFileRef = useRef<File | null>(null);
  const openButtonRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const historyForApi = useMemo(
    () => messages.slice(-8).map((msg) => ({ role: msg.role, content: msg.content })),
    [messages],
  );
  const selectedLanguage = findVoiceLanguage(preferences.languageId);
  const ui = useMemo(() => getVoiceChromeStrings(preferences.languageId), [preferences.languageId]);
  const recognitionCtor: SpeechRecognitionCtor | null =
    typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null : null;
  const useWhisperInput = Boolean(preferences.useOpenAiWhisperMic && audioCaps?.whisper);

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
        useOpenAiWhisperMic:
          typeof (parsed as Partial<VoicePreferences>).useOpenAiWhisperMic === "boolean"
            ? (parsed as Partial<VoicePreferences>).useOpenAiWhisperMic!
            : prev.useOpenAiWhisperMic,
        useOpenAiTtsPlayback:
          typeof (parsed as Partial<VoicePreferences>).useOpenAiTtsPlayback === "boolean"
            ? (parsed as Partial<VoicePreferences>).useOpenAiTtsPlayback!
            : prev.useOpenAiTtsPlayback,
      }));
    } catch {
      // Keep defaults when reading preferences fails.
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

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
    };
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
      setListeningError(getVoiceChromeStrings(preferences.languageId).errMicInterrupted);
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
    setMessages((prev) => {
      if (prev.length !== 1 || prev[0].role !== "assistant") return prev;
      const nextIntro = getVoiceChromeStrings(preferences.languageId).chatIntro;
      return [{ ...prev[0], content: nextIntro, languageId: preferences.languageId }];
    });
  }, [preferences.languageId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ transcript?: string }>;
      const transcript = customEvent.detail?.transcript?.trim();
      if (!transcript) return;
      setInput(transcript);
      window.dispatchEvent(new Event(MBKRU_CLOSE_A11Y_PANEL_EVENT));
      setIsOpen(true);
    };
    window.addEventListener("mbkru-voice-transcript", handler as EventListener);
    return () => window.removeEventListener("mbkru-voice-transcript", handler as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const closeChat = () => setIsOpen(false);
    window.addEventListener(MBKRU_CLOSE_VOICE_CHAT_EVENT, closeChat);
    return () => window.removeEventListener(MBKRU_CLOSE_VOICE_CHAT_EVENT, closeChat);
  }, []);

  function openVoiceChat() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(MBKRU_CLOSE_A11Y_PANEL_EVENT));
    }
    setIsOpen(true);
  }

  function speakAssistantReply(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const chunks = splitTextForSpeechSynthesis(text, 320);
    for (const chunk of chunks) {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = selectedLanguage.synthesisLang;
      utterance.rate = preferences.speechRate;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
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

  async function speakAssistantReplyOpenAi(text: string) {
    if (typeof window === "undefined") return;
    const trimmed = text.trim();
    if (!trimmed.length) return;
    stopOpenAiPlayback();
    const TTS_CHUNK = 3800;
    try {
      for (let i = 0; i < trimmed.length; i += TTS_CHUNK) {
        const piece = trimmed.slice(i, i + TTS_CHUNK);
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
        trackUiEvent("mbkru_voice_openai_tts_play", { language: preferences.languageId });
      }
    } catch {
      trackUiEvent("mbkru_voice_openai_tts_fallback_browser", { language: preferences.languageId });
      speakAssistantReply(trimmed);
    }
  }

  async function toggleWhisperRecording() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setListeningError(ui.errNoMic);
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

    setListeningError(null);
    const mime = pickRecorderMime();
    if (!mime) {
      setListeningError(ui.errNoWhisperMime);
      trackUiEvent("mbkru_voice_whisper_transcribe_error", { language: preferences.languageId, reason: "no_mime" });
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
        setListeningError(ui.errRecordingFailed);
        trackUiEvent("mbkru_voice_whisper_transcribe_error", { language: preferences.languageId, reason: "recorder" });
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
            setListeningError(ui.errNoAudio);
            trackUiEvent("mbkru_voice_whisper_transcribe_error", { language: preferences.languageId, reason: "empty" });
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
              setListeningError(
                data.error === "Too many requests" ? ui.errTranscribeRate : ui.errTranscribeGeneric,
              );
              trackUiEvent("mbkru_voice_whisper_transcribe_error", {
                language: preferences.languageId,
                reason: data.error ?? `http_${response.status}`,
              });
              return;
            }
            setInput((prev) => (prev ? `${prev} ${data.text}`.trim() : data.text!.trim()));
            trackUiEvent("mbkru_voice_whisper_transcribe_ok", { language: preferences.languageId });
          } catch {
            setListeningError(ui.errTranscribeReach);
            trackUiEvent("mbkru_voice_whisper_transcribe_error", { language: preferences.languageId, reason: "network" });
          } finally {
            setIsTranscribingWhisper(false);
          }
        })();
      };
      recorder.start(250);
      setIsWhisperRecording(true);
      trackUiEvent("mbkru_voice_whisper_record_start", { language: preferences.languageId });
    } catch {
      setListeningError(ui.errMicPermission);
      trackUiEvent("mbkru_voice_whisper_transcribe_error", { language: preferences.languageId, reason: "getusermedia" });
      stopWhisperMediaTracks();
      setIsWhisperRecording(false);
    }
  }

  const MAX_IMAGE_BYTES = 1.25 * 1024 * 1024; // keep JSON body within typical limits
  const MAX_PDF_BYTES = 1 * 1024 * 1024;
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
        setAttachmentNotice(ui.noticeImageSize);
        return;
      }
      setTextFileAttachment(null);
      setPdfAttachment(null);
      pendingPdfFileRef.current = null;
      pendingImageFileRef.current = file;
      setImageAttachment((prev) => {
        if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
        return { name: file.name, previewUrl: URL.createObjectURL(file) };
      });
      return;
    }
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
      if (file.size > MAX_TEXT_FILE_CHARS) {
        setAttachmentNotice(ui.noticeTextLarge);
        return;
      }
      pendingImageFileRef.current = null;
      pendingPdfFileRef.current = null;
      setPdfAttachment(null);
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
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      if (file.size > MAX_PDF_BYTES) {
        setAttachmentNotice(ui.noticePdfSize);
        return;
      }
      pendingImageFileRef.current = null;
      if (imageAttachment?.previewUrl) {
        URL.revokeObjectURL(imageAttachment.previewUrl);
        setImageAttachment(null);
      }
      setTextFileAttachment(null);
      pendingPdfFileRef.current = file;
      setPdfAttachment({ name: file.name });
      return;
    }
    setAttachmentNotice(ui.noticeAttachmentHint);
  }

  function clearAttachments() {
    pendingImageFileRef.current = null;
    pendingPdfFileRef.current = null;
    setPdfAttachment(null);
    setTextFileAttachment(null);
    setImageAttachment((prev) => {
      if (prev?.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setAttachmentNotice(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading || isTranscribingWhisper || isWhisperRecording) return;
    const trimmed = input.trim();
    const hasImage = Boolean(pendingImageFileRef.current && imageAttachment);
    const hasTextFile = Boolean(textFileAttachment?.text);
    const hasPdf = Boolean(pendingPdfFileRef.current && pdfAttachment);
    if (!trimmed && !hasImage && !hasTextFile && !hasPdf) return;

    const linePhoto = hasImage && imageAttachment ? `[Photo: ${imageAttachment.name}]` : "";
    const lineFile = hasTextFile && textFileAttachment ? `[File: ${textFileAttachment.name}]` : "";
    const linePdf = hasPdf && pdfAttachment ? `[PDF: ${pdfAttachment.name}]` : "";
    const combined =
      [linePhoto, lineFile, linePdf, trimmed].filter(Boolean).join("\n").trim() || "Help with my attachment(s).";
    const apiText =
      trimmed ||
      (hasTextFile && hasImage
        ? "Use the image and the attached file as context."
        : hasImage && hasPdf
          ? "Use the image and the attached PDF as context. Summarise or answer as relevant."
          : hasTextFile && hasPdf
            ? "Use the attached text file and PDF as context. Summarise or answer as relevant."
            : hasImage
              ? "Describe what is in the image. Relate to MBKRU, Ghana, or public accountability if relevant."
              : hasPdf
                ? "Summarise or answer using the attached PDF text. Note if anything is unclear."
                : hasTextFile
                  ? "Read and use the attached text. Summarise or answer my question in context."
                  : "");

    let imageBase64: string | undefined;
    if (pendingImageFileRef.current) {
      try {
        imageBase64 = await readFileAsDataUrl(pendingImageFileRef.current);
      } catch {
        setAttachmentNotice(ui.noticeReadImageFail);
        return;
      }
    }

    const fileTextForApi = textFileAttachment?.text;
    const fileNameForApi = textFileAttachment?.name ?? pdfAttachment?.name ?? "attachment";

    let pdfBase64: string | undefined;
    if (pendingPdfFileRef.current) {
      try {
        pdfBase64 = await readFileAsDataUrl(pendingPdfFileRef.current);
      } catch {
        setAttachmentNotice(ui.noticeReadPdfFail);
        return;
      }
    }

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
          pdfBase64,
          webSearch: useWebSearch,
        }),
      });

      if (!response.ok) throw new Error("MBKRU Voice request failed");
      const data = (await response.json()) as {
        answer?: string;
        suggestedLinks?: Array<{ label: string; href: string }>;
        source?: string;
        safetyReason?: string;
        sitePagePaths?: string[];
        webSearchUsed?: boolean;
      };
      const answeredAt = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer?.trim() || "I could not generate a response right now.",
          links: data.suggestedLinks ?? [],
          languageId: preferences.languageId,
          meta: {
            answeredAt,
            sitePagePaths: data.sitePagePaths,
            webSearchUsed: data.webSearchUsed === true,
          },
        },
      ]);
      if (preferences.autoReadReplies) {
        const answerText = data.answer?.trim() || "I could not generate a response right now.";
        if (preferences.useOpenAiTtsPlayback && audioCaps?.tts) {
          void speakAssistantReplyOpenAi(answerText);
        } else {
          speakAssistantReply(answerText);
        }
      }
      trackUiEvent("mbkru_voice_reply_received", {
        language: preferences.languageId,
        source: data.source ?? "unknown",
        safety_reason: data.safetyReason ?? null,
        site_context: (data.sitePagePaths ?? []).join(",").slice(0, 500) || null,
        web_search_used: data.webSearchUsed === true,
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
          meta: { answeredAt: new Date().toISOString() },
        },
      ]);
      if (preferences.autoReadReplies) {
        if (preferences.useOpenAiTtsPlayback && audioCaps?.tts) {
          void speakAssistantReplyOpenAi(fallback.answer);
        } else {
          speakAssistantReply(fallback.answer);
        }
      }
      trackUiEvent("mbkru_voice_reply_received", {
        language: preferences.languageId,
        source: "client-fallback",
        site_context: null,
        web_search_used: false,
      });
    } finally {
      setIsLoading(false);
    }
  }

  function applyQuickPrompt(prompt: string) {
    setInput(prompt);
  }

  function clearConversation() {
    stopOpenAiPlayback();
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
    setMessages([
      {
        role: "assistant",
        content: getVoiceChromeStrings(preferences.languageId).chatIntro,
        languageId: preferences.languageId,
      },
    ]);
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
          className="w-[min(30rem,96vw)] max-h-[min(78vh,44rem)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
          aria-label={ui.ariaChatbot}
          role="dialog"
          aria-modal="false"
        >
          <header className="relative border-b border-white/10 bg-[var(--primary)] px-3 py-2.5 pr-11 text-white sm:px-3.5 sm:pr-12 sm:py-2.5">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-1.5">
              <label htmlFor="mbkru-voice-lang" className="sr-only">
                {ui.srChatLanguage}
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
                aria-label={ui.ariaChatLanguage}
              >
                {voiceLanguageOptions.map((option) => (
                  <option key={option.id} value={option.id} className="text-black">
                    {voiceLanguageMenuLabel(preferences.languageId, option.id)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, autoReadReplies: !prev.autoReadReplies }))}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/40 text-white/95 hover:bg-white/15 ${focusRingSmClass}`}
                aria-pressed={preferences.autoReadReplies}
                title={preferences.autoReadReplies ? ui.readAloudTitleOn : ui.readAloudTitleOff}
                aria-label={preferences.autoReadReplies ? ui.readAloudAriaOn : ui.readAloudAriaOff}
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
                {ui.clearChat}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white shadow-sm hover:bg-white/25 ${focusRingSmClass}`}
              aria-label={ui.closeChatAria}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <div className="max-h-[min(52vh,28rem)] space-y-3 overflow-y-auto bg-[var(--section-light)] p-3.5 sm:p-4" aria-live="polite">
            <div className="flex flex-wrap gap-2">
              {ui.quickPrompts.map((entry) => (
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
                {message.role === "assistant" && message.meta ? (
                  <div
                    className={`mt-2 text-[10px] leading-relaxed text-[var(--muted-foreground)] ${
                      message.meta.sitePagePaths?.length || message.meta.webSearchUsed
                        ? "border-t border-[var(--border)]/80 pt-2"
                        : "pt-0.5"
                    }`}
                  >
                    {message.meta.sitePagePaths && message.meta.sitePagePaths.length > 0 ? (
                      <p className="text-[11px]">
                        <span className="font-semibold text-[var(--foreground)]/85">{ui.sitePagesPrefix} </span>
                        {message.meta.sitePagePaths.map((path, i) => (
                          <span key={path}>
                            {i > 0 ? " · " : null}
                            <Link
                              href={path}
                              className={`${primaryLinkClass} break-all font-medium`}
                              title={path}
                            >
                              {path}
                            </Link>
                          </span>
                        ))}
                      </p>
                    ) : null}
                    {message.meta.webSearchUsed ? (
                      <p className="mt-1">{ui.webSearchUsedNote}</p>
                    ) : null}
                    <p className="mt-1 opacity-95" title={message.meta.answeredAt}>
                      {ui.asOfPrefix}{" "}
                      {new Date(message.meta.answeredAt).toLocaleString(
                        voiceUiDateLocale(message.languageId ?? preferences.languageId),
                      )}
                    </p>
                  </div>
                ) : null}
                {message.role === "assistant" ? (
                  <p className="mt-2 inline-flex rounded-md bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--muted-foreground)]">
                    {getVoiceChromeStrings(message.languageId ?? "en-gh").languageBadge}
                  </p>
                ) : null}
              </article>
            ))}
            {isLoading ? (
              <p className="text-xs font-medium text-[var(--muted-foreground)]" role="status">
                {ui.thinking}
              </p>
            ) : null}
            {isTranscribingWhisper ? (
              <p className="text-xs font-medium text-[var(--muted-foreground)]" role="status">
                {ui.transcribingStatus}
              </p>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="border-t border-[var(--border)] bg-white p-2.5 sm:p-3">
            <p className="mb-2 text-[10px] leading-snug text-[var(--muted-foreground)]">
              {ui.aiDisclaimerBeforePrivacy}{" "}
              <Link href="/privacy" className={focusRingSmClass}>
                {ui.privacyLink}
              </Link>
            </p>
            <label htmlFor="mbkru-voice-input" className="sr-only">
              {ui.inputSrLabel}
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*,.txt,text/plain,.pdf,application/pdf"
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
                  {ui.remove}
                </button>
              </div>
            ) : null}
            {textFileAttachment ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-2 text-xs text-[var(--foreground)]">
                <span className="line-clamp-2 min-w-0 flex-1" title={textFileAttachment.name}>
                  {textFileAttachment.name} — {textFileAttachment.text.length.toLocaleString()} {ui.charactersSuffix}
                </span>
                <button
                  type="button"
                  onClick={clearAttachments}
                  className={`shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold ${focusRingSmClass}`}
                >
                  {ui.remove}
                </button>
              </div>
            ) : null}
            {pdfAttachment ? (
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-2 text-xs text-[var(--foreground)]">
                <span className="min-w-0 flex-1 font-medium">{pdfAttachment.name}</span>
                <span className="shrink-0 text-[var(--muted-foreground)]">PDF</span>
                <button
                  type="button"
                  onClick={clearAttachments}
                  className={`shrink-0 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold ${focusRingSmClass}`}
                >
                  {ui.remove}
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
                placeholder={ui.placeholder}
                className={`h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] ${focusRingSmClass}`}
                maxLength={2000}
              />
              <button
                type="button"
                onClick={() => {
                  if (useWhisperInput) void toggleWhisperRecording();
                  else startListeningForChat();
                }}
                disabled={
                  isLoading ||
                  isTranscribingWhisper ||
                  (useWhisperInput ? false : isListening || !recognitionCtor)
                }
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] disabled:opacity-45 ${focusRingSmClass} ${
                  isListening || isWhisperRecording ? "animate-pulse border-[var(--primary)]/40" : ""
                }`}
                aria-label={
                  useWhisperInput
                    ? isWhisperRecording
                      ? ui.micAriaWhisperStop
                      : ui.micAriaWhisperRecord
                    : isListening
                      ? ui.micAriaListening
                      : ui.micAriaBrowser
                }
                title={
                  useWhisperInput
                    ? isWhisperRecording
                      ? ui.micTitleWhisperStop
                      : ui.micTitleWhisperRecord
                    : isListening
                      ? ui.micTitleListening
                      : ui.micTitleBrowser
                }
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
                aria-label={ui.attachAria}
                title={ui.attachTitle}
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
                disabled={
                  isLoading ||
                  isTranscribingWhisper ||
                  isWhisperRecording ||
                  (!input.trim() && !imageAttachment && !textFileAttachment && !pdfAttachment)
                }
                className={`h-11 shrink-0 rounded-xl bg-[var(--primary)] px-3 text-sm font-semibold text-white disabled:opacity-55 sm:px-4 ${focusRingSmClass}`}
              >
                {ui.send}
              </button>
            </div>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                  checked={useWebSearch}
                  onChange={(e) => setUseWebSearch(e.target.checked)}
                />
                <span>{ui.webSearchCheckbox}</span>
              </label>
              {audioCaps && (audioCaps.whisper || audioCaps.tts) ? (
                <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-[var(--border)]/80 bg-[var(--section-light)]/60 px-2.5 py-2 text-[11px] leading-snug text-[var(--muted-foreground)] sm:max-w-[min(24rem,100%)]">
                  <span className="font-semibold text-[var(--foreground)]/90">{ui.cloudAudioHeading}</span>
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
                      <span>{ui.whisperMicCheckbox}</span>
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
                      <span>{ui.openAiTtsCheckbox}</span>
                    </label>
                  ) : null}
                  <span className="text-[10px] opacity-90">
                    {ui.cloudAudioFootnoteBeforePrivacy}{" "}
                    <Link href="/privacy" className={`${focusRingSmClass} font-medium text-[var(--foreground)]`}>
                      {ui.privacyLink}
                    </Link>
                  </span>
                </div>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{ui.helperFooter}</p>
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
          onClick={() => openVoiceChat()}
          onMouseDown={() => trackUiEvent("mbkru_voice_open_launcher")}
          className={`shrink-0 rounded-full bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[var(--primary-dark)] ${focusRingSmClass}`}
          aria-label={ui.launcherAria}
        >
          {ui.launcherButton}
        </button>
      )}
    </>
  );
}
