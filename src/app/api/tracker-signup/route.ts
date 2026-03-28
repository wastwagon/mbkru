import { LeadCaptureSource } from "@prisma/client";
import { NextResponse } from "next/server";

import { upsertLeadCapture } from "@/lib/server/lead-capture";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { emailOnlyBodySchema } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "tracker-signup"))) {
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

    await upsertLeadCapture(parsed.data.email, LeadCaptureSource.PARLIAMENT_TRACKER);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to sign up" },
      { status: 500 },
    );
  }
}
