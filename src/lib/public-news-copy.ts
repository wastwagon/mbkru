/** User-facing labels for published news counts — keep grammar consistent site-wide. */
export function formatPublishedNewsCount(count: number): string {
  if (count <= 0) return "No published stories yet";
  if (count === 1) return "1 published story";
  return `${count} published stories`;
}

export function newsArchiveLinkLabel(count: number): string {
  if (count <= 0) return "News";
  if (count === 1) return "View 1 story";
  return `View all ${count} stories`;
}

export function newsHeroMoreLabel(countBeyondHero: number, total: number): string {
  if (countBeyondHero <= 0) return "";
  if (countBeyondHero === total - Math.min(2, total)) {
    return `${countBeyondHero} more ${countBeyondHero === 1 ? "story" : "stories"} on News`;
  }
  return `${countBeyondHero} additional ${countBeyondHero === 1 ? "update" : "updates"}`;
}
