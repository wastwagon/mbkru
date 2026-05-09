/** Split long text into queued browser speech-synthesis chunks (sentence/word boundaries). */
export function splitTextForSpeechSynthesis(text: string, maxChars = 320): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const chunks: string[] = [];
  let rest = t;
  while (rest.length > 0) {
    if (rest.length <= maxChars) {
      chunks.push(rest);
      break;
    }
    let slice = rest.slice(0, maxChars);
    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace > maxChars * 0.55) {
      slice = rest.slice(0, lastSpace);
    }
    const piece = slice.trim();
    if (piece) chunks.push(piece);
    rest = rest.slice(slice.length).trimStart();
  }
  return chunks.filter(Boolean);
}
