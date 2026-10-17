import { NextRequest } from "next/server";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// ============================================================
// Image upload with deep content validation
// ============================================================

// Allowed image MIME types → safe extension mapping
const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
// SVG intentionally excluded (XSS risk via embedded scripts)

const MAX_SIZE = 5 * 1024 * 1024;

// Magic bytes for real content verification.
// For WebP, we check RIFF + offset 8-12 = "WEBP" (not just RIFF which
// would also match WAV, AVI, etc.)
interface ByteCheck { offset: number; bytes: number[]; }
const MAGIC: Record<string, ByteCheck[]> = {
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/gif": [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }], // GIF8
  "image/webp": [
    { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
    { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },  // WEBP (at offset 8)
  ],
};

function verifyMagic(buffer: Buffer, mimeType: string): boolean {
  const checks = MAGIC[mimeType];
  if (!checks) return false;
  for (const check of checks) {
    if (buffer.length < check.offset + check.bytes.length) return false;
    for (let i = 0; i < check.bytes.length; i++) {
      if (buffer[check.offset + i] !== check.bytes[i]) return false;
    }
  }
  return true;
}

// Deep validation: attempt to read image metadata with sharp
// (confirms the file is a decodable image, not just magic bytes)
async function validateDecodable(buffer: Buffer, mimeType: string): Promise<boolean> {
  try {
    const sharp = (await import("sharp")).default;
    const metadata = await sharp(buffer, { limitInputPixels: 40_000_000 }).metadata();
    // Verify it has valid image dimensions
    if (!metadata.width || !metadata.height || metadata.width < 1 || metadata.height < 1) {
      return false;
    }
    // Verify the detected format matches the claimed MIME type
    const formatMap: Record<string, string> = {
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const expectedFormat = formatMap[mimeType];
    if (expectedFormat && metadata.format && metadata.format !== expectedFormat) {
      return false;
    }
    return true;
  } catch {
    // sharp failed to decode — not a valid image
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });

  try {
    // Bound the multipart request before buffering/parsing it.
    const maxBody = MAX_SIZE + 64 * 1024;
    if (Number(req.headers.get("content-length") || 0) > maxBody) {
      return fail("حجم درخواست بیش از حد مجاز است.", 413);
    }
    if (!req.body) return fail("فایلی ارسال نشده است.", 422);
    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBody) {
        await reader.cancel();
        return fail("حجم درخواست بیش از حد مجاز است.", 413);
      }
      chunks.push(value);
    }
    const multipart = new Response(new Uint8Array(Buffer.concat(chunks)), {
      headers: { "Content-Type": req.headers.get("content-type") || "" },
    });
    const formData = await multipart.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") return fail("فایلی ارسال نشده است.", 422);

    // ---- 1. Validate MIME type from browser ----
    const mimeType = file.type;
    if (!ALLOWED_MIME[mimeType]) {
      return fail("فقط فایل‌های تصویری (JPEG, PNG, WebP, GIF) مجاز هستند.", 422);
    }

    // ---- 2. Validate file size ----
    if (file.size > MAX_SIZE) {
      return fail("حجم فایل نباید بیش از ۵ مگابایت باشد.", 422);
    }

    // ---- 3. Read buffer ----
    const buffer = Buffer.from(await file.arrayBuffer());

    // ---- 4. Validate magic bytes (content-level check, not just browser MIME) ----
    if (!verifyMagic(buffer, mimeType)) {
      return fail("محتوای فایل با فرمت اعلام‌شده همخوانی ندارد. فایل ممکن است تقلبی باشد.", 422);
    }

    // ---- 5. Deep validation: decode image with sharp ----
    // This confirms the file is actually a decodable image (not just magic bytes)
    const decodable = await validateDecodable(buffer, mimeType);
    if (!decodable) {
      return fail("فایل قابل رمزگشایی نیست. تصویر آسیب‌دیده یا نامعتبر است.", 422);
    }

    // ---- 6. Generate safe filename (extension from MIME, NOT user filename) ----
    const safeExt = ALLOWED_MIME[mimeType];
    const filename = `article-${randomUUID()}.${safeExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);

    // Re-encode to validate the pixel data and strip untrusted metadata.
    const sharp = (await import("sharp")).default;
    const format = mimeType === "image/jpeg" ? "jpeg" : safeExt as "png" | "webp" | "gif";
    const cleanBuffer = await sharp(buffer, { animated: true, limitInputPixels: 40_000_000 })
      .rotate().toFormat(format).toBuffer();
    if (cleanBuffer.length > MAX_SIZE) return fail("حجم تصویر بیش از حد مجاز است.", 422);
    await fs.writeFile(filepath, cleanBuffer, { flag: "wx", mode: 0o644 });

    const url = `/api/uploads/${filename}`;
    await logActivity({ actor: "admin", action: "file_upload", target: filename, ip: getClientIp(req), meta: { size: cleanBuffer.length, type: mimeType } });

    return ok({ url, filename, size: cleanBuffer.length });
  } catch (e: any) {
    return fail("خطا در بارگذاری فایل.", 500, { detail: e?.message });
  }
}
