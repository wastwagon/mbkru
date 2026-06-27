"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  signAndSubmitCouncilMpEvaluation,
  upsertCouncilMpEvaluationDraft,
} from "@/lib/server/council-mp-evaluation";
import { parseCouncilMpEvaluationDraft } from "@/lib/validation/council-mp-evaluation";
import { requireCommunityLeadership } from "@/lib/server/require-community-leadership";

export async function upsertCouncilMpEvaluationDraftAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(
    communitySlug,
    `/communities/${encodeURIComponent(communitySlug)}/portal#mp-evaluation`,
  );

  const parsed = parseCouncilMpEvaluationDraft(formData);
  if (!parsed.ok) return;

  const result = await upsertCouncilMpEvaluationDraft(leadership, parsed.value);
  if (!result.ok) return;

  revalidatePath(`/communities/${leadership.communitySlug}/portal`);
}

export async function signCouncilMpEvaluationAction(formData: FormData): Promise<void> {
  const communitySlug = String(formData.get("communitySlug") ?? "").trim().toLowerCase();
  const leadership = await requireCommunityLeadership(
    communitySlug,
    `/communities/${encodeURIComponent(communitySlug)}/portal#mp-evaluation`,
  );

  const evaluationIdParsed = z.object({ evaluationId: z.string().cuid() }).safeParse({
    evaluationId: formData.get("evaluationId"),
  });
  if (!evaluationIdParsed.success) return;

  const result = await signAndSubmitCouncilMpEvaluation(
    leadership,
    evaluationIdParsed.data.evaluationId,
  );
  if (!result.ok) return;

  revalidatePath(`/communities/${leadership.communitySlug}/portal`);
  revalidatePath("/admin/reports");
}
