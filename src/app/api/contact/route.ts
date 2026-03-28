import { NextResponse } from "next/server";

import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { sendContactNotification } from "@/lib/server/send-contact-email";
import { requireTurnstileIfConfigured } from "@/lib/server/verify-turnstile";
import { contactBodySchema } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "contact"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = contactBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const turnstileBlock = await requireTurnstileIfConfigured(
      request,
      parsed.data.turnstileToken,
    );
    if (turnstileBlock) return turnstileBlock;

    const { name, email, subject, message, enquiryType } = parsed.data;

    const out = await sendContactNotification({
      name,
      email,
      subject,
      message,
      enquiryType,
    });

    if (out.mode === "failed") {
      return NextResponse.json(
        { error: "Could not deliver your message. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
