import { NextResponse } from "next/server";

// Placeholder: integrate with newsletter list or separate beta list
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // TODO: Add to Citizens Voice beta list (Mailchimp tag, ConvertKit tag, or DB)
    console.log("Early access signup (Citizens Voice):", email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
