import "server-only";

import type { HubtelGhanaCardConfig } from "./hubtel-ghana-card-config";

export type HubtelGhanaCardVerifyInput = {
  ghanaCardNumber: string;
  surname: string;
  forenames: string;
  dateOfBirth?: string | null;
};

export type HubtelGhanaCardVerifyResult =
  | { ok: true; reference: string | null; responseCode: string | null }
  | { ok: false; reason: "NO_MATCH" | "INVALID_INPUT" | "PROVIDER_ERROR" | "PROVIDER_UNAVAILABLE"; message: string };

function hubtelBasicAuth(config: HubtelGhanaCardConfig): string {
  return Buffer.from(`${config.clientId}:${config.clientSecret}`, "utf8").toString("base64");
}

function parseHubtelSuccess(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;
  const o = payload as Record<string, unknown>;

  const responseCode = String(o.ResponseCode ?? o.responseCode ?? o.code ?? "").trim();
  if (responseCode === "0000" || responseCode === "200" || responseCode.toLowerCase() === "success") {
    return true;
  }

  const message = String(o.Message ?? o.message ?? "").toLowerCase();
  if (message.includes("success") || message.includes("valid") || message.includes("match")) {
    return true;
  }

  const data = o.Data ?? o.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d.IsValid === true || d.isValid === true || d.valid === true) return true;
    const status = String(d.status ?? d.Status ?? "").toLowerCase();
    if (status.includes("valid") || status.includes("match") || status === "verified") return true;
  }

  return false;
}

function extractReference(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  const data = o.Data ?? o.data;
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    const ref = d.TransactionId ?? d.transactionId ?? d.reference ?? d.Reference;
    if (typeof ref === "string" && ref.trim()) return ref.trim();
  }
  const top = o.TransactionId ?? o.transactionId ?? o.reference;
  return typeof top === "string" && top.trim() ? top.trim() : null;
}

async function verifyWithMock(input: HubtelGhanaCardVerifyInput): Promise<HubtelGhanaCardVerifyResult> {
  const card = input.ghanaCardNumber.toUpperCase();
  if (card === "GHA-000000000-0" && input.surname.trim().length >= 2 && input.forenames.trim().length >= 2) {
    return { ok: true, reference: "mock-verification", responseCode: "0000" };
  }
  return {
    ok: false,
    reason: "NO_MATCH",
    message: "Mock verification failed. Use card GHA-000000000-0 with any legal name in dev.",
  };
}

export async function verifyGhanaCardWithHubtel(
  config: HubtelGhanaCardConfig,
  input: HubtelGhanaCardVerifyInput,
): Promise<HubtelGhanaCardVerifyResult> {
  if (config.mockMode) return verifyWithMock(input);

  const path = config.verifyPath.startsWith("/") ? config.verifyPath : `/${config.verifyPath}`;
  const url = `${config.baseUrl}${path}`;

  const body: Record<string, string> = {
    GhanaCardNumber: input.ghanaCardNumber,
    Surname: input.surname.trim(),
    Forenames: input.forenames.trim(),
  };
  if (input.dateOfBirth?.trim()) {
    body.DateOfBirth = input.dateOfBirth.trim();
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${hubtelBasicAuth(config)}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    let payload: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text) as unknown;
      } catch {
        payload = { raw: text.slice(0, 500) };
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        reason: res.status >= 500 ? "PROVIDER_UNAVAILABLE" : "PROVIDER_ERROR",
        message: "Identity verification service returned an error. Try again later.",
      };
    }

    if (parseHubtelSuccess(payload)) {
      return {
        ok: true,
        reference: extractReference(payload),
        responseCode: String(
          (payload as Record<string, unknown>)?.ResponseCode ??
            (payload as Record<string, unknown>)?.responseCode ??
            (payload as Record<string, unknown>)?.code ??
            "",
        ) || null,
      };
    }

    return {
      ok: false,
      reason: "NO_MATCH",
      message: "Ghana Card details did not match NIA records. Check your card number and legal name.",
    };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return {
      ok: false,
      reason: aborted ? "PROVIDER_UNAVAILABLE" : "PROVIDER_ERROR",
      message: "Could not reach identity verification service. Try again shortly.",
    };
  } finally {
    clearTimeout(timer);
  }
}
