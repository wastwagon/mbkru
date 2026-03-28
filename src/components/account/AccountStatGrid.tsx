export type AccountStatGridProps = {
  totalReports: number;
  activeReports: number;
  resolvedReports: number;
  attachmentCount: number;
  lastSubmittedAt: Date | null;
};

function StatCard({
  label,
  value,
  hint,
  stripe,
}: {
  label: string;
  value: number;
  hint?: string;
  stripe: "gold" | "primary" | "slate";
}) {
  const stripeClass =
    stripe === "gold"
      ? "from-[var(--accent-gold)] via-[var(--accent-gold-bright)] to-[var(--accent-gold)]"
      : stripe === "primary"
        ? "from-[var(--primary)] to-[var(--primary)]/70"
        : "from-[var(--muted-foreground)]/40 to-[var(--muted-foreground)]/20";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-b from-white to-[var(--section-light)]/40 p-5 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stripeClass}`}
        aria-hidden
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-bold tabular-nums tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-snug text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

export function AccountStatGrid({
  totalReports,
  activeReports,
  resolvedReports,
  attachmentCount,
  lastSubmittedAt,
}: AccountStatGridProps) {
  const lastLabel = lastSubmittedAt
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(lastSubmittedAt)
    : null;

  return (
    <section className="mt-8" aria-labelledby="account-stats-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="account-stats-heading"
            className="font-display text-lg font-semibold text-[var(--foreground)]"
          >
            Your Voice activity
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Signed-in submissions and how they move through review.
          </p>
        </div>
        {lastLabel ? (
          <p className="text-xs text-[var(--muted-foreground)]">
            Last submission · <span className="text-[var(--foreground)]">{lastLabel}</span>
          </p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total reports"
          value={totalReports}
          hint={totalReports === 0 ? "Submit your first report to populate this dashboard." : undefined}
          stripe="gold"
        />
        <StatCard
          label="In progress"
          value={activeReports}
          hint="Received, under review, or escalated."
          stripe="primary"
        />
        <StatCard
          label="Closed"
          value={resolvedReports}
          hint="Closed or archived outcomes."
          stripe="slate"
        />
        <StatCard
          label="Files attached"
          value={attachmentCount}
          hint="Photos and documents across your reports."
          stripe="gold"
        />
      </div>
    </section>
  );
}
