"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";
import { logAdminOperationalAudit } from "@/lib/server/admin-operational-audit";

const cuid = z.string().cuid();

const emailSchema = z.string().trim().toLowerCase().email().max(320);

const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(200);

function opsRedirect(path: string): never {
  redirect(path);
}

export async function createAdminOperatorAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      passwordConfirm: z.string(),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirm: formData.get("passwordConfirm"),
    });

  if (!parsed.success) {
    opsRedirect("/admin/operators?error=invalid");
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    opsRedirect("/admin/operators?error=mismatch");
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  try {
    const created = await prisma.admin.create({
      data: {
        email: parsed.data.email,
        password: hash,
        active: true,
      },
      select: { id: true, email: true },
    });
    await logAdminOperationalAudit({
      adminId: session.adminId,
      action: "admin_operator_created",
      details: { targetAdminId: created.id, email: created.email },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      opsRedirect("/admin/operators?error=duplicate");
    }
    throw e;
  }

  revalidatePath("/admin/operators");
  revalidatePath("/admin/operational-audit");
  opsRedirect("/admin/operators?saved=created");
}

export async function setAdminOperatorActiveAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      adminId: cuid,
      active: z.enum(["0", "1"]),
    })
    .safeParse({
      adminId: formData.get("adminId"),
      active: formData.get("active"),
    });
  if (!parsed.success) {
    opsRedirect("/admin/operators?error=invalid");
  }

  const targetActive = parsed.data.active === "1";

  const prior = await prisma.admin.findUnique({
    where: { id: parsed.data.adminId },
    select: { active: true },
  });
  if (!prior) {
    opsRedirect("/admin/operators?error=notfound");
  }

  if (!targetActive && prior.active) {
    const others = await prisma.admin.count({
      where: { active: true, id: { not: parsed.data.adminId } },
    });
    if (others === 0) {
      opsRedirect("/admin/operators?error=last_active");
    }
  }

  await prisma.admin.update({
    where: { id: parsed.data.adminId },
    data: { active: targetActive },
  });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "admin_operator_active_changed",
    details: { targetAdminId: parsed.data.adminId, active: targetActive },
  });

  revalidatePath("/admin/operators");
  revalidatePath("/admin/operational-audit");
  opsRedirect("/admin/operators?saved=status");
}

export async function setAdminOperatorPasswordAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      adminId: cuid,
      password: passwordSchema,
      passwordConfirm: z.string(),
    })
    .safeParse({
      adminId: formData.get("adminId"),
      password: formData.get("password"),
      passwordConfirm: formData.get("passwordConfirm"),
    });
  if (!parsed.success) {
    opsRedirect("/admin/operators?error=invalid");
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    opsRedirect("/admin/operators?error=mismatch");
  }

  const target = await prisma.admin.findUnique({ where: { id: parsed.data.adminId }, select: { id: true } });
  if (!target) {
    opsRedirect("/admin/operators?error=notfound");
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.admin.update({
    where: { id: parsed.data.adminId },
    data: { password: hash },
  });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "admin_operator_password_reset",
    details: { targetAdminId: parsed.data.adminId },
  });

  revalidatePath("/admin/operators");
  revalidatePath("/admin/operational-audit");
  opsRedirect("/admin/operators?saved=password");
}

/** Current operator sets own password — requires existing password verification. */
export async function changeOwnAdminPasswordAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();

  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      password: passwordSchema,
      passwordConfirm: z.string(),
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      password: formData.get("password"),
      passwordConfirm: formData.get("passwordConfirm"),
    });
  if (!parsed.success) {
    opsRedirect("/admin/operators?error=invalid");
  }
  if (parsed.data.password !== parsed.data.passwordConfirm) {
    opsRedirect("/admin/operators?error=mismatch");
  }

  const me = await prisma.admin.findUnique({ where: { id: session.adminId }, select: { password: true } });
  if (!me) {
    opsRedirect("/admin/operators?error=notfound");
  }

  const ok = await bcrypt.compare(parsed.data.currentPassword, me.password);
  if (!ok) {
    opsRedirect("/admin/operators?error=current");
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.admin.update({
    where: { id: session.adminId },
    data: { password: hash },
  });

  await logAdminOperationalAudit({
    adminId: session.adminId,
    action: "admin_operator_password_self_change",
    details: {},
  });

  revalidatePath("/admin/operators");
  revalidatePath("/admin/operational-audit");
  opsRedirect("/admin/operators?saved=own");
}
