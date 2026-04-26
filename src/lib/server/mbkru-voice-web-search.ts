/**
 * Real-time web context for MBKRU Voice (Tavily). When `TAVILY_API_KEY` is unset, returns no context
 * and callers should still run the model without web augmentation.
 */
export type WebSearchForVoiceResult = {
  /** Markdown-flavoured block to inject for the model */
  block: string;
  /** Whether the Tavily API returned at least one result or an answer */
  hasResults: boolean;
  /** Human-readable reason (not shown to end users) */
  mode: "tavily" | "no_api_key" | "error" | "empty";
};

const MAX_QUERY_LEN = 280;

function trimQuery(q: string): string {
  return q.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LEN) || "helpful public information current news";
}

export async function getWebContextForMbkruVoice(
  userMessage: string,
  fileExcerpt: string,
): Promise<WebSearchForVoiceResult> {
  const key = process.env.TAVILY_API_KEY?.trim();
  if (!key) {
    return { block: "", hasResults: false, mode: "no_api_key" };
  }

  const query = trimQuery(`${userMessage} ${fileExcerpt}`.slice(0, MAX_QUERY_LEN * 2));

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        search_depth: "basic",
        include_answer: true,
        include_raw_content: false,
        max_results: 5,
        topic: "general",
      }),
    });

    if (!res.ok) {
      return { block: "", hasResults: false, mode: "error" };
    }

    const data = (await res.json()) as {
      answer?: string;
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };

    const parts: string[] = [];
    if (data.answer?.trim()) {
      parts.push("Summary (web search):", data.answer.trim());
    }
    const resList = (data.results ?? [])
      .slice(0, 5)
      .filter((r) => (r.content ?? r.title) && r.url);
    for (const r of resList) {
      const line = `- ${(r.title ?? "Source").replace(/\s+/g, " ").trim()}: ${(r.content ?? "").replace(/\s+/g, " ").trim().slice(0, 320)} (${r.url})`;
      parts.push(line);
    }

    const block = parts.length > 0 ? parts.join("\n") : "";
    return {
      block,
      hasResults: Boolean(block),
      mode: block ? "tavily" : "empty",
    };
  } catch {
    return { block: "", hasResults: false, mode: "error" };
  }
}
