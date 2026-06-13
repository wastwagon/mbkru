import { describe, expect, it } from "vitest";

import { formatPublishedNewsCount, newsArchiveLinkLabel } from "@/lib/public-news-copy";

describe("public news copy", () => {
  it("formats singular and plural counts", () => {
    expect(formatPublishedNewsCount(0)).toBe("No published stories yet");
    expect(formatPublishedNewsCount(1)).toBe("1 published story");
    expect(formatPublishedNewsCount(5)).toBe("5 published stories");
  });

  it("formats archive link labels", () => {
    expect(newsArchiveLinkLabel(0)).toBe("News");
    expect(newsArchiveLinkLabel(1)).toBe("View 1 story");
    expect(newsArchiveLinkLabel(5)).toBe("View all 5 stories");
  });
});
