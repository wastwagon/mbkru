import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/db/prisma";
import { MalwareScanError, scanUploadedFileOrThrow } from "@/lib/server/upload-malware-scan";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const alt = typeof formData.get("alt") === "string" ? formData.get("alt") as string : "";

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
  }

  const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
  const safeExt = ext.match(/^\.\w{2,5}$/) ? ext : ".bin";
  const filename = `${randomUUID()}${safeExt}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const diskPath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await scanUploadedFileOrThrow(buffer, "admin-media");
  } catch (err) {
    if (err instanceof MalwareScanError) {
      return NextResponse.json(
        {
          error:
            err.code === "infected" ? "File blocked by malware scanner" : "Upload scanner unavailable",
        },
        { status: err.code === "infected" ? 400 : 503 },
      );
    }
    throw err;
  }
  await writeFile(diskPath, buffer);

  const storagePath = `/uploads/${filename}`;
  const record = await prisma.media.create({
    data: {
      filename: file.name.slice(0, 200),
      storagePath,
      mimeType: file.type,
      alt: alt.trim() || null,
    },
  });

  return NextResponse.json(record);
}
