import { headers } from "next/headers";

/** Pathname forwarded by `src/proxy.ts` for server components (e.g. compact footer). */
export async function getRequestPathname(): Promise<string> {
  const h = await headers();
  return h.get("x-mbkru-pathname")?.trim() ?? "";
}
