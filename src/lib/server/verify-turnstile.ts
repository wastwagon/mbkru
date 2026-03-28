import { NextResponse } from "next/server";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteverifyJson = { success?: boolean };

export function isTurnstileEnforced(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export function clientIpFromRequest(request: Request): string | undefined {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    undefined
  );
}

export async function verifyTurnstileToken(
  token: string,
  remoteip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteip) body.set("remoteip", remoteip);

  const res = await fetch(SITEVERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return false;
  const data = (await res.json()) as SiteverifyJson;
  return data.success === true;
}

/** When `TURNSTILE_SECRET_KEY` is set, require a valid token or return a JSON error response. */
export async function requireTurnstileIfConfigured(
  request: Request,
  token: string | undefined | null,
): Promise<NextResponse | null> {
  if (!isTurnstileEnforced()) return null;

  const t = token?.trim();
  if (!t) {
    return NextResponse.json(
      { error: "Please complete the verification challenge." },
      { status: 400 },
    );
  }

  const ok = await verifyTurnstileToken(t, clientIpFromRequest(request));
  if (!ok) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 403 },
    );
  }

  return null;
}

export function turnstileTokenFromFormData(formData: FormData): string | undefined {
  const t = formData.get("turnstileToken");
  if (typeof t === "string" && t.trim()) return t.trim();
  const cf = formData.get("cf-turnstile-response");
  if (typeof cf === "string" && cf.trim()) return cf.trim();
  return undefined;
}
