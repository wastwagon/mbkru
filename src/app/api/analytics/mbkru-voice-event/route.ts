import { NextResponse } from "next/server";

import { recordMbkruVoiceAnalyticsEvent } from "@/lib/server/mbkru-voice-analytics";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { mbkruVoiceAnalyticsBodySchema } from "@/lib/validation/mbkru-voice";

const maxPayloadChars = 2000;
const maxPayloadEntries = 20;

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
  const fromBody = bodyToken?.trim();
  return Boolean(fromBody) && fromBody === requiredToken;
}

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-analytics"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const raw = await request.json();
    const parsed = mbkruVoiceAnalyticsBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid event name" }, { status: 400 });
    }
    const { name, payload: rawPayload, token } = parsed.data;
    if (!isTelemetryTokenValid(request, token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = sanitizePayload(rawPayload);
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
