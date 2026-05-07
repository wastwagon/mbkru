import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const PRIVATE_SCHEME = "private://";
const DEFAULT_PRIVATE_UPLOADS_ROOT = path.join(process.cwd(), "var", "private-uploads");

function sanitizeSegment(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("..") || trimmed.includes(path.sep)) {
    throw new Error("Invalid private storage segment.");
  }
  return trimmed;
}

function rootDir(): string {
  const configured = process.env.PRIVATE_UPLOADS_DIR?.trim();
  if (!configured) return DEFAULT_PRIVATE_UPLOADS_ROOT;
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

export function makePrivateStoragePath(bucket: string, segments: string[]): string {
  const safeBucket = sanitizeSegment(bucket);
  const safeSegments = segments.map(sanitizeSegment);
  return `${PRIVATE_SCHEME}${[safeBucket, ...safeSegments].join("/")}`;
}

export function isPrivateStoragePath(storagePath: string): boolean {
  return storagePath.startsWith(PRIVATE_SCHEME);
}

export function resolvePrivateStorageDiskPath(storagePath: string): string {
  if (!isPrivateStoragePath(storagePath)) {
    throw new Error("Storage path is not private.");
  }
  const raw = storagePath.slice(PRIVATE_SCHEME.length);
  const segments = raw.split("/").filter(Boolean).map(sanitizeSegment);
  if (segments.length < 2) {
    throw new Error("Invalid private storage path.");
  }
  return path.join(rootDir(), ...segments);
}

export async function writePrivateUploadFile(args: {
  bucket: string;
  segments: string[];
  bytes: Buffer;
}): Promise<string> {
  const storagePath = makePrivateStoragePath(args.bucket, args.segments);
  const diskPath = resolvePrivateStorageDiskPath(storagePath);
  await mkdir(path.dirname(diskPath), { recursive: true });
  await writeFile(diskPath, args.bytes);
  return storagePath;
}

export async function readPrivateUploadFile(storagePath: string): Promise<Buffer> {
  const diskPath = resolvePrivateStorageDiskPath(storagePath);
  return readFile(diskPath);
}
