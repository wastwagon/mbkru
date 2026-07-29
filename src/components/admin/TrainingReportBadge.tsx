import { StatusBadge } from "@/components/ui/Badge";
import { isTrainingCitizenReport } from "@/lib/reports/training-data";

type Props = {
  trackingCode: string;
  title: string;
  className?: string;
};

/** Visible staff cue that a citizen report is demo/seed training data — not real intake. */
export function TrainingReportBadge({ trackingCode, title, className = "" }: Props) {
  if (!isTrainingCitizenReport({ trackingCode, title })) return null;
  return (
    <StatusBadge tone="warning" className={className} title="Demo or seed row — not real programme intake">
      Training
    </StatusBadge>
  );
}
