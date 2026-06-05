/** Consistent date+time display for citizen submissions and public audit trails (Ghana-facing locale). */

const submissionLocale = "en-GB" as const;

const submissionOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

export function formatSubmissionDateTime(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(submissionLocale, submissionOptions);
}

/** Date-only label for catalogue cards and MP sheets (handles JSON/unstable_cache strings). */
export function formatMediumDate(input: Date | string | null | undefined): string {
  if (input == null) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(submissionLocale, { dateStyle: "medium" });
}

export function submissionDateTimeIso(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}
