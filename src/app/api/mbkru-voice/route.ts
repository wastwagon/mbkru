import { NextResponse } from "next/server";

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
import { extractPdfText, pdfBufferFromPayload } from "@/lib/server/extract-pdf-text";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { getWebContextForMbkruVoice } from "@/lib/server/mbkru-voice-web-search";
import { getMbkruVoiceSiteKnowledgeForMessage } from "@/lib/mbkru-voice-site-knowledge";
import { mbkruVoiceChatBodySchema } from "@/lib/validation/mbkru-voice";
import type { VoicePreferences } from "@/lib/voice-languages";

/** OpenAI + optional Tavily + PDF parse can exceed default on some hosts. */
export const maxDuration = 60;

function getOpenAiApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function stripBinaryPayloadForSafety(text: string): string {
  return text
    .replace(/data:image\/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]+/g, "[image]")
    .replace(/data:application\/pdf;base64,[A-Za-z0-9+/=]+/g, "[pdf]");
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
      pdfBase64: rawPdf,
      webSearch: wantWeb,
    } = parsed.data;

    const fileText = rawFileText?.trim() ? rawFileText : undefined;
    const imageBase64 = rawImage?.trim() ? rawImage : undefined;
    const languageId: VoicePreferences["languageId"] = rawLanguageId ?? "en-gh";

    const displayName =
      rawFileName?.trim() ||
      (rawPdf?.trim() ? "attachment.pdf" : fileText ? "attachment.txt" : "attachment");

    let pdfExtractedText = "";
    if (rawPdf?.trim()) {
      const buf = pdfBufferFromPayload(rawPdf);
      if (!buf) {
        return NextResponse.json({ error: "Invalid PDF data" }, { status: 400 });
      }
      const { text, error } = await extractPdfText(buf);
      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }
      pdfExtractedText = text.length > 0 ? text : "(No extractable text — PDF may be scan-only or protected.)";
    }

    const txtBlock =
      fileText && fileText.length > 0
        ? `Attached text file (${displayName}):\n${fileText.slice(0, 36_000)}`
        : "";
    const pdfBlock =
      rawPdf?.trim() && pdfExtractedText.length > 0
        ? `Attached PDF (${displayName}):\n${pdfExtractedText.slice(0, 58_000)}`
        : "";

    const fileBlock = [txtBlock, pdfBlock].filter(Boolean).join("\n\n");

    const fullTextForModel = [rawMessage, fileBlock].filter(Boolean).join("\n\n").trim();
    if (!fullTextForModel) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const safety = evaluateMbkruVoiceSafety(stripBinaryPayloadForSafety(fullTextForModel));
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

    const siteKnowledge = getMbkruVoiceSiteKnowledgeForMessage(rawMessage);
    const webSnippet = [
      siteKnowledge.block ? siteKnowledge.block.slice(0, 1_200) : "",
      fileText?.slice(0, 1_200),
      pdfExtractedText.slice(0, 1_200),
    ]
      .filter(Boolean)
      .join("\n");

    const web = wantWeb
      ? await getWebContextForMbkruVoice(fullTextForModel, webSnippet)
      : { block: "", hasResults: false, mode: "no_api_key" as const };

    const systemPrompt = buildMbkruVoiceSystemPrompt(
      languageId,
      web.hasResults && web.block ? web.block : "",
      siteKnowledge.block,
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
          siteContextUsed: siteKnowledge.pagePaths.length > 0,
          sitePagePaths: siteKnowledge.pagePaths,
          imageUsed: Boolean(imageBase64),
          pdfUsed: Boolean(rawPdf?.trim()),
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
        : rawPdf?.trim()
          ? `${fallback.answer} (A PDF was received; full text extraction works best with OPENAI_API_KEY for follow-up answers.)`
          : fallback.answer,
      source: "fallback",
      suggestedLinks: fallback.suggestedLinks ?? [],
      webSearchUsed: false,
      siteContextUsed: siteKnowledge.pagePaths.length > 0,
      sitePagePaths: siteKnowledge.pagePaths,
      imageUsed: Boolean(imageBase64),
      pdfUsed: Boolean(rawPdf?.trim()),
    });
  } catch {
    return NextResponse.json({ error: "Unable to process MBKRU Voice request" }, { status: 500 });
  }
}
