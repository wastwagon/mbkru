import { NextResponse } from "next/server";

// Placeholder: integrate with Mailchimp or ConvertKit API
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let email: string;
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
    } else {
      const formData = await request.formData();
      email = formData.get("email") as string;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // TODO: Add to Mailchimp/ConvertKit list
    // Example: await mailchimp.lists.addListMember(listId, { email_address: email })
    console.log("Newsletter signup:", email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
