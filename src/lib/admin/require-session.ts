import "server-only";

import { redirect } from "next/navigation";

import { getAdminSession } from "./session";

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
