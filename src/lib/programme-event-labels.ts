import type { ProgrammeEventKind } from "@prisma/client";

export function programmeEventKindLabel(kind: ProgrammeEventKind): string {
  switch (kind) {
    case "TOWN_HALL":
      return "Town hall";
    case "REGIONAL_FORUM":
      return "Regional forum";
    case "CONSTITUENCY_DEBATE":
      return "Constituency debate";
    default:
      return kind;
  }
}
