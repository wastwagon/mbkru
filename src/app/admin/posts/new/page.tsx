import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import { PostEditor } from "../PostEditor";

export default async function NewPostPage() {
  await requireAdminSession();
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return <PostEditor post={null} media={media} />;
}
