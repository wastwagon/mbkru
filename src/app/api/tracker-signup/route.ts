import { NextResponse } from "next/server";

// Placeholder: integrate with newsletter list or separate tracker list
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

    // TODO: Add to Parliament Tracker notification list
    console.log("Tracker signup:", email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 }
    );
  }
}
