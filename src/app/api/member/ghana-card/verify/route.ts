import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isDatabaseConfigured } from "@/lib/db/prisma";
import { guardMemberAuthApi } from "@/lib/member/auth-api-guard";
import { getMemberSession } from "@/lib/member/session";
import { verifyMemberGhanaCard } from "@/lib/server/member-ghana-card";
import { isHubtelGhanaCardConfigured } from "@/lib/server/hubtel-ghana-card-config";
import { allowGhanaCardVerifyRequest } from "@/lib/server/rate-limit";
import { requireTurnstileIfConfigured } from "@/lib/server/verify-turnstile";
import { parseGhanaCardVerifyBody } from "@/lib/validation/ghana-card-verify";

export async function POST(request: Request) {
  const denied = guardMemberAuthApi();
  if (denied) return denied;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  if (!isHubtelGhanaCardConfigured()) {
    return NextResponse.json(
      { error: "Ghana Card verification is not available on this site yet.", code: "NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const session = await getMemberSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!(await allowGhanaCardVerifyRequest(request, session.memberId))) {
    return NextResponse.json({ error: "Too many verification attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = parseGhanaCardVerifyBody(body);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Enter a valid Ghana Card number (GHA-XXXXXXXXX-X) and your legal name." },
        { status: 400 },
      );
    }

    const turnstileBlock = await requireTurnstileIfConfigured(request, parsed.value.turnstileToken);
    if (turnstileBlock) return turnstileBlock;

    const outcome = await verifyMemberGhanaCard({
      memberId: session.memberId,
      normalizedCard: parsed.value.normalizedCard,
      surname: parsed.value.surname,
      forenames: parsed.value.forenames,
      dateOfBirth: parsed.value.dateOfBirth,
    });

    if (!outcome.ok) {
      const status =
        outcome.code === "ALREADY_VERIFIED"
          ? 409
          : outcome.code === "CARD_IN_USE"
            ? 409
            : outcome.code === "NOT_CONFIGURED"
              ? 503
              : outcome.code === "PROVIDER_UNAVAILABLE"
                ? 503
                : 400;
      return NextResponse.json({ error: outcome.message, code: outcome.code }, { status });
    }

    revalidatePath("/account");
    revalidatePath("/citizens-voice/submit");

    return NextResponse.json({
      ok: true,
      verifiedAt: outcome.verifiedAt,
      lastFour: outcome.lastFour,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification could not be completed." }, { status: 500 });
  }
}
