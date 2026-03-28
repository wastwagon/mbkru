import "server-only";

import { NextResponse } from "next/server";

import { getServerPlatformPhase, platformFeatures } from "@/config/platform";

export function isCitizensVoiceEnabled(): boolean {
  return platformFeatures.citizensVoicePlatform(getServerPlatformPhase());
}

export function citizensVoiceDisabledResponse(): NextResponse {
  return NextResponse.json(
    { error: "MBKRU Voice reporting is not enabled for this deployment." },
    { status: 403 },
  );
}
