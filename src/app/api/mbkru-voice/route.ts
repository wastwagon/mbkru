import { NextResponse } from "next/server";

/** OpenAI + optional Tavily can exceed default on some hosts. */
export const maxDuration = 60;

import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";
import {
  buildMbkruVoiceModelMessages,
  buildMbkruVoiceSystemPrompt,
  buildMbkruVoiceUserContent,
  fetchMbkruVoiceOpenAi,
  MBKRU_VOICE_VISION_MODEL,
  type ChatMessage,
} from "@/lib/mbkru-voice-openai";
import { evaluateMbkruVoiceSafety } from "@/lib/mbkru-voice-guardrails";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { getWebContextForMbkruVoice } from "@/lib/server/mbkru-voice-web-search";
import { mbkruVoiceChatBodySchema } from "@/lib/validation/mbkru-voice";
import type { VoicePreferences } from "@/lib/voice-languages";

function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function stripDataUrlForSafety(text: string): string {
  return text.replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/g, "[image]");
}

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "mbkru-voice-chat"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const raw = await request.json();
    const parsed = mbkruVoiceChatBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const {
      message: rawMessage,
      history: rawHistory,
      languageId: rawLanguageId,
      imageBase64: rawImage,
      fileText: rawFileText,
      fileName: rawFileName,
      webSearch: wantWeb,
    } = parsed.data;

    const fileText = rawFileText?.trim() ? rawFileText : undefined;
    const fileName = rawFileName?.trim() || "attachment.txt";
    const imageBase64 = rawImage?.trim() ? rawImage : undefined;
    const languageId: VoicePreferences["languageId"] = rawLanguageId ?? "en-gh";

    const fileBlock =
      fileText && fileText.length > 0
        ? `Attached file (${fileName}):\n${fileText.slice(0, 36_000)}`
        : "";

    const fullTextForModel = [rawMessage, fileBlock].filter(Boolean).join("\n\n").trim();
    if (!fullTextForModel) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const safety = evaluateMbkruVoiceSafety(stripDataUrlForSafety(fullTextForModel));
    if (safety.blocked) {
      return NextResponse.json({
        answer: safety.answer,
        source: "safety-guardrail",
        suggestedLinks: safety.suggestedLinks,
        safetyReason: safety.reason,
      });
    }

    const history = (rawHistory ?? []).slice(-8);
    const textHistory: Array<{ role: "user" | "assistant"; content: string }> = history.map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 2000),
    }));

    const web = wantWeb
      ? await getWebContextForMbkruVoice(
          fullTextForModel,
          fileText ? fileText.slice(0, 1_200) : "",
        )
      : { block: "", hasResults: false, mode: "no_api_key" as const };

    const systemPrompt = buildMbkruVoiceSystemPrompt(
      languageId,
      web.hasResults && web.block ? web.block : "",
    );

    const lastUser: ChatMessage = {
      role: "user",
      content: buildMbkruVoiceUserContent(fullTextForModel, imageBase64 ?? null),
    };

    const openAiMessages: ChatMessage[] = buildMbkruVoiceModelMessages(
      systemPrompt,
      textHistory,
      lastUser,
    );

    const apiKey = getOpenAiApiKey();
    if (apiKey) {
      const providerReply = await fetchMbkruVoiceOpenAi({
        apiKey,
        model: MBKRU_VOICE_VISION_MODEL,
        messages: openAiMessages,
      });
      if (providerReply) {
        return NextResponse.json({
          answer: providerReply,
          source: wantWeb && web.hasResults ? "ai-provider+web" : "ai-provider",
          suggestedLinks: [],
          webSearchUsed: wantWeb && web.hasResults,
          imageUsed: Boolean(imageBase64),
        });
      }
    }

    const fallback = getMbkruVoiceFallbackReply(
      fullTextForModel.length > 800 ? fullTextForModel.slice(0, 800) : fullTextForModel,
      languageId,
    );
    return NextResponse.json({
      answer: imageBase64
        ? `${fallback.answer} (A photo was received; full image understanding needs the AI service — add OPENAI_API_KEY. For urgent issues use Contact on the site.)`
        : fallback.answer,
      source: "fallback",
      suggestedLinks: fallback.suggestedLinks ?? [],
      webSearchUsed: false,
      imageUsed: Boolean(imageBase64),
    });
  } catch {
    return NextResponse.json({ error: "Unable to process MBKRU Voice request" }, { status: 500 });
  }
}
