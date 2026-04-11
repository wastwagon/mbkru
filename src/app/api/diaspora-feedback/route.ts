import { NextResponse } from "next/server";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { createDiasporaFeedbackSubmission } from "@/lib/server/diaspora-feedback-submission";
import { allowPublicFormRequest } from "@/lib/server/rate-limit";
import { requireTurnstileIfConfigured } from "@/lib/server/verify-turnstile";
import { diasporaFeedbackBodySchema } from "@/lib/validation/public-forms";

export async function POST(request: Request) {
  if (!(await allowPublicFormRequest(request, "diaspora-feedback"))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Feedback recording is not available right now. Please try again later or contact the team directly." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const parsed = diasporaFeedbackBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const turnstileBlock = await requireTurnstileIfConfigured(
      request,
      parsed.data.turnstileToken,
    );
    if (turnstileBlock) return turnstileBlock;

    const {
      fullName,
      email,
      dateOfVisit,
      durationOfStay,
      eventsAttended,
      overallRating,
      meaningfulAspects,
      suggestionsImprovement,
      returnOrInvest,
      signature,
      formSignedDate,
    } = parsed.data;

    try {
      await createDiasporaFeedbackSubmission({
        fullName,
        email,
        dateOfVisit,
        durationOfStay,
        eventsAttended,
        overallRating,
        meaningfulAspects,
        suggestionsImprovement,
        returnOrInvest,
        signature,
        formSignedDate,
      });
    } catch (e) {
      console.error("[diaspora-feedback] failed to persist submission", e);
      return NextResponse.json(
        { error: "Could not save your feedback. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
