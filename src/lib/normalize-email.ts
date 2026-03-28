/** Normalise marketing / lead emails for storage and deduplication. */
export function normalizeLeadEmail(email: string): string {
  return email.trim().toLowerCase();
}
