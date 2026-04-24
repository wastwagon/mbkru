import { NextResponse } from "next/server";

import { getMbkruVoiceFallbackReply } from "@/lib/mbkru-voice-faq";
import { evaluateMbkruVoiceSafety } from "@/lib/mbkru-voice-guardrails";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { mbkruVoiceChatBodySchema } from "@/lib/validation/mbkru-voice";
import { findVoiceLanguage, type VoicePreferences } from "@/lib/voice-languages";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

async function getProviderReply(
  history: ChatMessage[],
  languageId: VoicePreferences["languageId"],
): Promise<string | null> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) return null;
  const selectedLanguage = findVoiceLanguage(languageId);

  const systemPrompt =
    `You are MBKRU Voice, an intelligent, always-online customer service assistant for MBKRU Advocates in Ghana. Reply in ${selectedLanguage.label} when possible. Be concise, factual, civic-safe, non-partisan, and helpful. Never provide legal strategy, medical instructions, self-harm guidance, or violence instructions. If unsafe or unclear, route users to official support pages.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 280,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content && content.length > 0 ? content : null;
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
    const { message: rawMessage, history: rawHistory, languageId: rawLanguageId } = parsed.data;
    const message = rawMessage.slice(0, 1000);
    const languageId: VoicePreferences["languageId"] = rawLanguageId ?? "en-gh";
    const safety = evaluateMbkruVoiceSafety(message);
    if (safety.blocked) {
      return NextResponse.json({
        answer: safety.answer,
        source: "safety-guardrail",
        suggestedLinks: safety.suggestedLinks,
        safetyReason: safety.reason,
      });
    }

    const history = (rawHistory ?? []).slice(-8);
    const sanitizedHistory = history.map((entry) => ({
      role: entry.role,
      content: entry.content.slice(0, 1000),
    }));
    const promptHistory: ChatMessage[] = [...sanitizedHistory, { role: "user", content: message.slice(0, 1000) }];

    const providerReply = await getProviderReply(promptHistory, languageId);
    if (providerReply) {
      return NextResponse.json({
        answer: providerReply,
        source: "ai-provider",
        suggestedLinks: [],
      });
    }

    const fallback = getMbkruVoiceFallbackReply(message, languageId);
    return NextResponse.json({
      answer: fallback.answer,
      source: "fallback",
      suggestedLinks: fallback.suggestedLinks ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Unable to process MBKRU Voice request" }, { status: 500 });
  }
}
