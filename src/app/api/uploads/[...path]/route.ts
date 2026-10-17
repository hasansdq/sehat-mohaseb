import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  // Reject traversal instead of silently converting it into a different filename.
  if (!parts.length || parts.some(part => !part || part === "." || part === ".." || /[/\\\x00]/.test(part))) {
    return new Response("Forbidden", { status: 403 });
  }
  const contentType = CONTENT_TYPES[path.extname(parts.at(-1)!).toLowerCase()];
  if (!contentType) return new Response("Not Found", { status: 404 });

  try {
    const root = await fs.realpath(UPLOAD_DIR);
    const filepath = await fs.realpath(path.resolve(root, ...parts));
    const relative = path.relative(root, filepath);
    // A symlink must not expose files outside the uploads volume either.
    if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      return new Response("Forbidden", { status: 403 });
    }
    const stat = await fs.stat(filepath);
    if (!stat.isFile() || stat.size > 20 * 1024 * 1024) return new Response("Not Found", { status: 404 });
    const data = await fs.readFile(filepath);
    const etag = `"${createHash("sha256").update(data).digest("hex")}"`;
    const headers = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // Also protect legacy SVG images when opened as documents.
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "ETag": etag,
    };
    if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    return new Response(new Uint8Array(data), { headers });
  } catch (error: any) {
    if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) return new Response("Not Found", { status: 404 });
    console.error("Upload read failed:", error.code || "unknown");
    return new Response("Unable to read image", { status: 500 });
  }
}
