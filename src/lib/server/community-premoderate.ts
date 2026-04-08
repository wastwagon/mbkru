import "server-only";

/** When true (default), ordinary members' posts start as PENDING until admin publish. Set `COMMUNITY_PREMODERATE_DEFAULT=false` to auto-publish (dev/staging only). */
export function defaultCommunityPostPremoderation(): boolean {
  return process.env.COMMUNITY_PREMODERATE_DEFAULT !== "false";
}
