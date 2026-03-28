import { NextResponse } from "next/server";

import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { emailOnlyBodySchema } from "@/lib/validation/public-forms";

// Placeholder: integrate with newsletter list or separate beta list
export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "early-access"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const e = formData.get("email");
    const parsed = emailOnlyBodySchema.safeParse({
      email: typeof e === "string" ? e : "",
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    // TODO: Add to Citizens Voice beta list (Mailchimp tag, ConvertKit tag, or DB)
    console.log("Early access signup (Citizens Voice):", parsed.data.email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 },
    );
  }
}
