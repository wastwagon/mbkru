#!/usr/bin/env node
/**
 * Smoke-test POST /api/mbkru-voice against a running Next dev/start server.
 *
 * Loads .env for OPENAI_API_KEY check only — the server must be started with env already loaded (same terminal or dotenv via your process manager).
 *
 * Usage:
 *   OPENAI_API_KEY=... npm run smoke:voice
 *   VOICE_URL=http://127.0.0.1:1101/api/mbkru-voice npm run smoke:voice
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFile = path.join(root, ".env");
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

const url =
  process.env.VOICE_URL?.trim() ||
  `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://127.0.0.1:1100"}/api/mbkru-voice`;

const serverHasKeyHint = Boolean(process.env.OPENAI_API_KEY?.trim());

const payload = {
  message: process.env.VOICE_SMOKE_MESSAGE?.trim() || "Say MBKRU is online in fewer than fifteen words.",
  languageId: "en-gh",
  webSearch: false,
};

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  console.error("Non-JSON response (first 400 chars):", text.slice(0, 400));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      url,
      httpStatus: res.status,
      source: json.source ?? null,
      openAiConfiguredInThisShell: serverHasKeyHint,
      answerPreview: typeof json.answer === "string" ? json.answer.slice(0, 220) : null,
      error: json.error ?? null,
    },
    null,
    2,
  ),
);

if (!res.ok) process.exit(1);
if (!json.answer) process.exit(1);

/** Server loads OPENAI_API_KEY only at process start — this flag is what we assert for end-to-end. */
if (json.source === "ai-provider" || json.source === "ai-provider+web") {
  console.error("\nOK — OpenAI path returned a model reply.");
  process.exit(0);
}

console.error(
  "\nChat route works, but replies used **fallback**, not OpenAI. Add OPENAI_API_KEY to `.env`, restart `npm run dev`, then rerun this smoke test.",
);
process.exit(2);
