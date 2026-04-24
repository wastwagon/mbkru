import { NextResponse } from "next/server";

import { recordMbkruVoiceAnalyticsEvent } from "@/lib/server/mbkru-voice-analytics";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

type Body = {
  name?: string;
  payload?: Record<string, unknown>;
  token?: string;
};

const eventNameRegex = /^[a-z0-9_]{3,120}$/;
const maxPayloadChars = 2000;
const maxPayloadEntries = 20;
const allowedEvents = new Set([
  "mbkru_voice_open_launcher",
  "mbkru_voice_send",
  "mbkru_voice_reply_received",
  "mbkru_voice_mic_start",
  "mbkru_voice_mic_error",
  "mbkru_voice_clear_chat",
  "accessibility_read_page_summary",
  "accessibility_read_selected_text",
  "accessibility_stt_start",
  "accessibility_stt_result",
  "accessibility_stt_error",
  "accessibility_send_transcript_to_chat",
]);

function sanitizePayload(raw: Record<string, unknown>): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  const entries = Object.entries(raw).slice(0, maxPayloadEntries);
  for (const [key, value] of entries) {
    if (typeof value === "string") out[key] = value.slice(0, 240);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
    else if (value === null) out[key] = null;
  }
  return out;
}

function isTelemetryTokenValid(request: Request, bodyToken?: string): boolean {
  const requiredToken = process.env.MBKRU_VOICE_EVENT_TOKEN?.trim();
  if (!requiredToken) return true;
  const provided = request.headers.get("x-mbkru-event-token")?.trim();
  if (provided && provided === requiredToken) return true;
  return Boolean(bodyToken) && bodyToken.trim() === requiredToken;
}

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-analytics"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Body;
    if (!isTelemetryTokenValid(request, body.token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const name = body.name?.trim().toLowerCase();
    if (!name || !eventNameRegex.test(name) || !allowedEvents.has(name)) {
      return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
    }

    const payload = sanitizePayload(body.payload ?? {});
    const payloadText = JSON.stringify(payload);
    if (payloadText.length > maxPayloadChars) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const languageRaw = payload.language;
    const language = typeof languageRaw === "string" ? languageRaw.slice(0, 16) : null;

    await recordMbkruVoiceAnalyticsEvent({
      eventName: name,
      source: "client",
      language,
      payload,
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }
}
