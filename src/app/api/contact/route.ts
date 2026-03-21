import { NextResponse } from "next/server";

// Placeholder: integrate with your email service (e.g. Resend, SendGrid)
// For production: add reCAPTCHA validation, rate limiting
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, enquiryType } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Send email via Resend, SendGrid, or other provider
    // Example: await resend.emails.send({ from, to, subject, html })
    console.log("Contact form submission:", { name, email, subject, message, enquiryType });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
