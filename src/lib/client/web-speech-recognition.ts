/**
 * Web Speech API — minimal typings for Chromium / Safari constructors.
 * DOM `lib` typings are incomplete for vendor-prefixed globals used at runtime.
 */

export type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous?: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
}

export interface SpeechRecognitionEventLike extends Event {
  results: {
    readonly length: number;
    [index: number]: { readonly 0: { transcript: string } };
  };
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

export {};
