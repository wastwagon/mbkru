import { NextResponse } from "next/server";

import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { contactBodySchema } from "@/lib/validation/public-forms";

// Placeholder: integrate with your email service (e.g. Resend, SendGrid)
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

    const { name, email, subject, message, enquiryType } = parsed.data;

    // TODO: Send email via Resend, SendGrid, or other provider
    console.log("Contact form submission:", {
      name,
      email,
      subject,
      message,
      enquiryType,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
