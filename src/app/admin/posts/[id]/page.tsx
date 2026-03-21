import { notFound } from "next/navigation";

import { requireAdminSession } from "@/lib/admin/require-session";
import { prisma } from "@/lib/db/prisma";

import { PostEditor } from "../PostEditor";

type Props = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { featuredMedia: true },
  });
  if (!post) notFound();
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return <PostEditor post={post} media={media} />;
}
