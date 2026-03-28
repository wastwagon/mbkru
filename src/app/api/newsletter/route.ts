import { LeadCaptureSource } from "@prisma/client";
import { NextResponse } from "next/server";

import { upsertLeadCapture } from "@/lib/server/lead-capture";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { emailOnlyBodySchema } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "newsletter"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let raw: unknown;
    if (contentType.includes("application/json")) {
      raw = await request.json();
    } else {
      const formData = await request.formData();
      const e = formData.get("email");
      raw = { email: typeof e === "string" ? e : "" };
    }

    const parsed = emailOnlyBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    await upsertLeadCapture(parsed.data.email, LeadCaptureSource.NEWSLETTER);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 },
    );
  }
}
