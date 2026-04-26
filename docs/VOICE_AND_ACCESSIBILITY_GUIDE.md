# MBKRU Voice & Accessibility Guide

This guide covers the production setup and QA checklist for:

- `MBKRU Voice` always-online chatbot
- voice accessibility controls (text-to-speech and speech-to-text)
- local language options (Twi, Ga, Hausa, Ewe)

## Features implemented

- Floating chatbot launcher: `MBKRU Voice`
- Chatbot panel with:
  - language selector
  - microphone input
  - optional image + `.txt` attachments (vision + file text sent to the model when `OPENAI_API_KEY` is set)
  - optional live web context when `TAVILY_API_KEY` is set and “Search the web” is enabled
  - localized quick prompts
  - optional read-aloud assistant replies
  - clear-chat action
- Floating accessibility icon with:
  - read page summary
  - read selected text
  - speech-to-text dictation
  - transcript handoff into chatbot
  - speed/language preferences

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Optional (recommended) | `gpt-4o-mini` for `POST /api/mbkru-voice` (text, image data URLs, and `.txt` in the same request) |
| `TAVILY_API_KEY` | Optional | Live web context when the user leaves “Search the web” on (server-only; [Tavily](https://tavily.com)) |
| `MBKRU_VOICE_EVENT_TOKEN` | Optional (recommended in production) | Server-side token for accepting telemetry ingestion |
| `NEXT_PUBLIC_MBKRU_VOICE_EVENT_TOKEN` | Optional (with token mode) | Client token sent with telemetry ingestion requests |
| `REDIS_URL` | Optional (recommended in production) | Shared rate-limit state across multiple instances |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Optional | Chat and public API throttling behavior |

If `OPENAI_API_KEY` is not set, MBKRU Voice stays available via built-in intent fallback responses.

## Browser support and caveats

- Speech APIs depend on browser and OS voice engine support.
- Local languages (Twi, Ga, Hausa, Ewe) are exposed in UI and requested in API calls, but voice recognition/synthesis quality depends on available device language packs.
- All voice interactions have keyboard and typed-input alternatives.

## QA checklist (release gate)

- Keyboard-only flow:
  - open/close accessibility panel
  - open/close chatbot
  - submit chat message
  - activate mic button
- Escape behavior:
  - Escape closes accessibility panel
  - Escape closes chatbot and restores focus
- Voice flow:
  - dictation creates transcript
  - transcript sends to chatbot
  - assistant reply can be read aloud
- Language flow:
  - switch language in chatbot
  - send message and verify response language behavior
  - verify fallback response still works when provider is unavailable
- Mobile flow:
  - no overlap between floating controls
  - panels remain scrollable and usable on small screens

## Security and resilience notes

- Chat endpoint is rate-limited (`mbkru-voice-chat` bucket).
- Event ingestion endpoint is rate-limited (`mbkru-voice-analytics` bucket).
- History sent to provider is clipped and sanitized.
- Provider failure falls back to deterministic local responses.
- Safety guardrails block emergency/self-harm/legal-strategy prompts and route users to support pages.
- Avoid sending sensitive secrets or personal data in prompts.
