import { NextResponse } from "next/server";

import { mbkruVoiceLanguageIdSchema } from "@/lib/validation/mbkru-voice";
import { whisperLanguageHint, whisperTranscribeFromBuffer } from "@/lib/server/mbkru-voice-audio-openai";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-transcribe"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Speech recognition is not configured" }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
  }

  const rawLang = form.get("languageId");
  const parsedLang =
    typeof rawLang === "string"
      ? mbkruVoiceLanguageIdSchema.safeParse(rawLang.trim())
      : { success: false as const };

  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Recording is too large (max about 15 MB)" }, { status: 413 });
  }
  if (audio.size === 0) {
    return NextResponse.json({ error: "Empty recording" }, { status: 400 });
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const languageHint =
    parsedLang.success ? whisperLanguageHint(parsedLang.data) : undefined;

  const result = await whisperTranscribeFromBuffer({
    apiKey,
    buffer,
    mimeType: audio.type || null,
    languageHint,
    filenameFallback: audio.name || "recording.webm",
  });

  if (!result?.text?.length) {
    return NextResponse.json({ error: "Could not transcribe audio" }, { status: 502 });
  }

  return NextResponse.json({
    text: result.text.slice(0, 4000),
  });
}
