import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { VoiceDiscussionPanel } from "@/components/voice/VoiceDiscussionPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { primaryNavLinkClass } from "@/lib/primary-link-styles";
import { reportKindLabel } from "@/lib/report-status-text";
import { isCitizensVoiceEnabled } from "@/lib/reports/citizens-voice-gate";
import { buildVoiceDiscussionPayload } from "@/lib/server/voice-discussion-payload";
import type { CitizenReportKind } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ reportId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reportId } = await params;
  const data = await buildVoiceDiscussionPayload(reportId);
  if (!data) return { title: "Discussion" };
  return {
    title: `${data.title} · Discussion`,
    description: data.body.slice(0, 160),
  };
}

export default async function VoiceDiscussionPage({ params }: Props) {
  if (!isCitizensVoiceEnabled() || !isDatabaseConfigured()) notFound();

  const { reportId } = await params;
  const data = await buildVoiceDiscussionPayload(reportId);
  if (!data) notFound();

  const kindLabel = reportKindLabel(data.kind as CitizenReportKind);

  return (
    <div>
      <PageHeader
        title={data.title}
        description={`${kindLabel}${data.figure ? ` · ${data.figure.name}${data.figure.role ? ` (${data.figure.role})` : ""}` : ""}${data.regionName ? ` · ${data.regionName}` : ""}. Public discussion — full narrative below; sign in to comment or react.`}
        breadcrumbCurrentLabel="Discussion"
      />

      <section className="section-spacing section-full bg-[var(--section-light)] pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-sm text-[var(--muted-foreground)]">
            <Link href="/report-card" className={primaryNavLinkClass}>
              ← People&apos;s Report Card
            </Link>
            {" · "}
            <Link href="/citizens-voice/submit" className={primaryNavLinkClass}>
              Submit a report
            </Link>
          </p>

          <VoiceDiscussionPanel initial={data} reportId={reportId} />
        </div>
      </section>
    </div>
  );
}
