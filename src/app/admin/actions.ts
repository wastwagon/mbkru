"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminCookieName } from "@/lib/admin/session";

export async function logoutAction() {
  (await cookies()).delete(adminCookieName());
  redirect("/admin/login");
}
