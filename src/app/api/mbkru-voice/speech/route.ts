import { NextResponse } from "next/server";
import { z } from "zod";

import { openAiSpeechSynthesize } from "@/lib/server/mbkru-voice-audio-openai";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  text: z.string().trim().min(1).max(4096),
  voice: z
    .enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"])
    .optional(),
  /** Maps from UI speechRate (typically 0.7–1.2) — OpenAI `speed` same band. */
  speed: z.number().min(0.7).max(1.2).optional(),
});

function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-speech"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Text-to-speech is not configured" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const mp3 = await openAiSpeechSynthesize({
    apiKey,
    text: parsed.data.text,
    voice: parsed.data.voice,
    speed: parsed.data.speed,
  });

  if (!mp3 || mp3.length === 0) {
    return NextResponse.json({ error: "Unable to synthesize speech" }, { status: 502 });
  }

  return new NextResponse(new Uint8Array(mp3), {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}
