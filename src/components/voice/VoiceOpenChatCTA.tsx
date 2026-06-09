"use client";

import { openVoiceChat } from "@/lib/a11y-voice-dispatch";
import { focusRingSmClass } from "@/lib/primary-link-styles";

type Props = {
  className?: string;
  /** When true, show on all breakpoints (default: mobile only). */
  allBreakpoints?: boolean;
};

/** Opens MBKRU Voice chat — primary entry on mobile where the FAB is hidden. */
export function VoiceOpenChatCTA({ className = "", allBreakpoints = false }: Props) {
  return (
    <button
      type="button"
      onClick={() => openVoiceChat()}
      className={`inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-[var(--primary-dark)] active:scale-[0.99] motion-reduce:active:scale-100 ${allBreakpoints ? "" : "w-full lg:hidden"} ${focusRingSmClass} ${className}`}
    >
      <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      Open MBKRU Voice chat
    </button>
  );
}
