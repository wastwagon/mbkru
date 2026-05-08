import { NextResponse } from "next/server";

import { allowPublicFormRequest } from "@/lib/server/rate-limit";

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

/** Public: whether server can run Whisper / OpenAI TTS (no key values exposed). */
export async function GET(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-audio-capabilities"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const openai = hasOpenAiKey();
  return NextResponse.json({
    whisper: openai,
    tts: openai,
  });
}
