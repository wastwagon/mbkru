import "server-only";

import { Resend } from "resend";

export async function sendPetitionSignatureVerificationEmail(params: {
  to: string;
  petitionTitle: string;
  confirmUrl: string;
}): Promise<{ mode: "sent" | "skipped" | "failed"; detail?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "MBKRU <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[petition-verify] RESEND_API_KEY unset — cannot send verification email");
    return { mode: "skipped", detail: "no_api_key" };
  }

  const resend = new Resend(apiKey);
  const subject = `Confirm your signature: ${params.petitionTitle.slice(0, 80)}${params.petitionTitle.length > 80 ? "…" : ""}`;
  const text = [
    "You asked to sign an MBKRU petition. Confirm your email to add your signature.",
    "",
    `Petition: ${params.petitionTitle}`,
    "",
    `Confirm (link expires in 48 hours):`,
    params.confirmUrl,
    "",
    "If you did not request this, you can ignore this message.",
    "",
    "— MBKRU",
  ].join("\n");

  const { data, error } = await resend.emails.send({
    from,
    to: [params.to],
    subject,
    text,
  });

  if (error) {
    console.error("[petition-verify] Resend error:", error);
    return { mode: "failed", detail: error.message };
  }

  console.info("[petition-verify] sent to", params.to, data?.id ?? "");
  return { mode: "sent" };
}
