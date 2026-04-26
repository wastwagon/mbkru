import { findVoiceLanguage, type VoicePreferences } from "@/lib/voice-languages";

type ChatPartText = { type: "text"; text: string };
type ChatPartImage = { type: "image_url"; image_url: { url: string; detail: "low" | "high" } };

type ChatContent = string | (ChatPartText | ChatPartImage)[];

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: ChatContent;
};

function normalizeDataUrlForVision(imageBase64: string): { url: string } | null {
  const t = imageBase64.trim();
  if (!t.startsWith("data:image/") || !t.includes(";base64,")) return null;
  if (t.length > 2_200_000) return null; // hard cap
  return { url: t };
}

export function buildMbkruVoiceUserContent(message: string, imageBase64?: string | null): ChatContent {
  const text = message.trim() || "Please respond.";
  if (!imageBase64?.trim()) {
    return text;
  }
  const img = normalizeDataUrlForVision(imageBase64);
  if (!img) {
    return text;
  }
  return [
    { type: "text" as const, text },
    { type: "image_url" as const, image_url: { url: img.url, detail: "low" } },
  ];
}

export function buildMbkruVoiceSystemPrompt(
  languageId: VoicePreferences["languageId"],
  webContextBlock: string,
  siteKnowledgeBlock: string = "",
): string {
  const selectedLanguage = findVoiceLanguage(languageId);
  const base = `You are MBKRU Voice, an intelligent, always-online customer service assistant for MBKRU Advocates in Ghana. Reply in ${selectedLanguage.label} when possible. Be concise, factual, civic-safe, non-partisan, and helpful. Never provide legal strategy, medical instructions, self-harm guidance, or violence instructions. If unsafe or unclear, route users to official support pages.

If the user attached an image, describe or interpret it accurately and relate it to their question when natural.
If the user message includes text extracted from a PDF, use it faithfully; note that scan-only PDFs may have little or no text.
For passport, Ghana Card, nationality, or consular processing: signpost to official .gov.gh sites and the site’s /diaspora page; MBKRU does not issue ID or book appointments.
If a "MBKRU website" block is present, prefer it for in-site navigation, diaspora signposting, and programme routes before guessing. When both website and web search apply, use website for paths and web for time-sensitive or off-site news.
If a "Web information" block is present below, treat it as recent third-party information — summarise it, avoid copying URLs verbatim, and do not present it as your own private knowledge. Say when the answer is based on a live search when that block was used.`;

  let out = base;
  if (siteKnowledgeBlock.trim()) {
    out = `${out}

==== MBKRU website (curated) ====
${siteKnowledgeBlock}
==== End MBKRU website ====`;
  }
  if (!webContextBlock) return out;
  return `${out}

==== Web information (for this turn only) ====
${webContextBlock}
==== End web information ====`;
}

export function buildMbkruVoiceModelMessages(
  systemPrompt: string,
  textHistory: Array<{ role: "user" | "assistant"; content: string }>,
  lastUser: ChatMessage,
): ChatMessage[] {
  return [{ role: "system", content: systemPrompt }, ...textHistory, lastUser];
}

export type { ChatMessage, ChatContent };

/** Model that supports text + image in a single user message. */
export const MBKRU_VOICE_VISION_MODEL = "gpt-4o-mini" as const;

export async function fetchMbkruVoiceOpenAi(
  args: { apiKey: string; model: string; messages: ChatMessage[] },
): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      temperature: 0.2,
      messages: args.messages,
      max_tokens: 450,
    }),
  });

  if (!response.ok) return null;
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content && content.length > 0 ? content : null;
}
