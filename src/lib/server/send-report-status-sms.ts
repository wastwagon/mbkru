import "server-only";

import { buildReportStatusSmsBody, reportKindLabel } from "@/lib/report-status-text";
import type { CitizenReportKind, CitizenReportStatus } from "@prisma/client";

export type SmsSendMode = "skipped" | "sent" | "failed";

type SendResult = { mode: SmsSendMode; detail?: string };

function getProvider(): "none" | "log" | "twilio" {
  const raw = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (raw === "log" || raw === "twilio") return raw;
  return "none";
}

function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length < 4) return "***";
  return `${d.slice(0, 2)}…${d.slice(-2)}`;
}

async function sendViaTwilio(to: string, body: string): Promise<SendResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!sid || !token || !from) {
    console.info("[report-status-sms] TWILIO_* incomplete — skip SMS to", maskPhone(to));
    return { mode: "skipped", detail: "twilio_env_incomplete" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`, "utf8").toString("base64");

  const form = new URLSearchParams();
  form.set("To", to);
  form.set("From", from);
  form.set("Body", body);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const json = (await res.json().catch(() => ({}))) as { message?: string; sid?: string; error_message?: string };

  if (!res.ok) {
    const detail = json.message || json.error_message || res.statusText;
    console.error("[report-status-sms] Twilio error:", detail);
    return { mode: "failed", detail };
  }

  console.info("[report-status-sms] Twilio sid", json.sid ?? "");
  return { mode: "sent" };
}

/**
 * Optional SMS when `SMS_PROVIDER=log` (dev) or `SMS_PROVIDER=twilio` with TWILIO_* set.
 * Phone must already be E.164 (e.g. +233…).
 */
export async function sendReportStatusSms(params: {
  to: string;
  trackingCode: string;
  kind: CitizenReportKind;
  status: CitizenReportStatus;
}): Promise<SendResult> {
  const provider = getProvider();
  const to = params.to.trim();
  if (!to.startsWith("+")) {
    console.warn("[report-status-sms] reject non-E.164 to", maskPhone(to));
    return { mode: "failed", detail: "phone_not_e164" };
  }

  const body = buildReportStatusSmsBody({
    kind: params.kind,
    status: params.status,
    trackingCode: params.trackingCode,
  });

  if (provider === "none") {
    console.info(
      "[report-status-sms] SMS_PROVIDER unset — skip SMS to",
      maskPhone(to),
      `(${reportKindLabel(params.kind)})`,
    );
    return { mode: "skipped" };
  }

  if (provider === "log") {
    console.info("[report-status-sms] log provider →", maskPhone(to), body);
    return { mode: "sent" };
  }

  return sendViaTwilio(to, body);
}
