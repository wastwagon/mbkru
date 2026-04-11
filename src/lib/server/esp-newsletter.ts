import "server-only";

import { createHash } from "node:crypto";

export type EspNewsletterPushResult = {
  provider: "none" | "mailchimp" | "convertkit";
  ok: boolean;
  detail?: string;
};

function mailchimpDataCenter(apiKey: string): string | null {
  const idx = apiKey.lastIndexOf("-");
  if (idx === -1 || idx === apiKey.length - 1) return null;
  return apiKey.slice(idx + 1).trim();
}

function subscriberHashLowerEmail(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

async function mailchimpUpsertMember(
  apiKey: string,
  listId: string,
  email: string,
): Promise<{ ok: boolean; detail?: string }> {
  const dc = mailchimpDataCenter(apiKey);
  if (!dc) return { ok: false, detail: "Invalid MAILCHIMP_API_KEY (missing -dc suffix)" };

  const normalized = email.trim().toLowerCase();
  const hash = subscriberHashLowerEmail(email);
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${encodeURIComponent(listId)}/members/${hash}`;
  const auth = Buffer.from(`anystring:${apiKey}`, "utf8").toString("base64");

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: normalized,
      status_if_new: "subscribed",
      status: "subscribed",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (res.ok) return { ok: true };

  let detail: string | undefined;
  try {
    const j = (await res.json()) as { title?: string; detail?: string };
    detail = [j.title, j.detail].filter(Boolean).join(": ") || undefined;
  } catch {
    detail = await res.text().catch(() => undefined);
  }
  return { ok: false, detail: detail || `HTTP ${res.status}` };
}

async function convertKitSubscribe(
  apiSecret: string,
  formId: string,
  email: string,
): Promise<{ ok: boolean; detail?: string }> {
  const normalized = email.trim().toLowerCase();
  const url = `https://api.convertkit.com/v3/forms/${encodeURIComponent(formId)}/subscribe`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiSecret, email: normalized }),
    signal: AbortSignal.timeout(12_000),
  });

  if (res.ok) return { ok: true };

  let detail: string | undefined;
  try {
    const j = (await res.json()) as { message?: string };
    detail = j.message;
  } catch {
    detail = await res.text().catch(() => undefined);
  }
  return { ok: false, detail: detail || `HTTP ${res.status}` };
}

/**
 * Best-effort sync after Postgres `LeadCapture` — failures are logged only; callers should not block users.
 * Mailchimp takes precedence when both Mailchimp and ConvertKit env sets are present.
 */
export async function pushNewsletterSubscriptionToEspIfConfigured(
  email: string,
): Promise<EspNewsletterPushResult> {
  const mcKey = process.env.MAILCHIMP_API_KEY?.trim();
  const mcList = process.env.MAILCHIMP_LIST_ID?.trim();
  const ckSecret = process.env.CONVERTKIT_API_SECRET?.trim();
  const ckForm = process.env.CONVERTKIT_FORM_ID?.trim();

  if (mcKey && mcList) {
    const { ok, detail } = await mailchimpUpsertMember(mcKey, mcList, email);
    if (!ok) console.error("[esp-newsletter] Mailchimp sync failed:", detail ?? "unknown");
    return { provider: "mailchimp", ok, detail };
  }

  if (ckSecret && ckForm) {
    const { ok, detail } = await convertKitSubscribe(ckSecret, ckForm, email);
    if (!ok) console.error("[esp-newsletter] ConvertKit sync failed:", detail ?? "unknown");
    return { provider: "convertkit", ok, detail };
  }

  return { provider: "none", ok: true };
}
