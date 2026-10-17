import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";
import { setSetting } from "@/lib/settings";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.backupRecord.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  try {
    // ---- Resolve DB path from DATABASE_URL ----
    const rawUrl = process.env.DATABASE_URL || "";
    const dbPath = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;
    if (!dbPath) return fail("DATABASE_URL تنظیم نشده است.", 500);

    // ---- Backup directory: relative to DB file path (NOT hardcoded) ----
    const dbDir = path.dirname(dbPath);
    const backupDir = path.join(dbDir, "backups");
    await fs.mkdir(backupDir, { recursive: true });

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = path.join(backupDir, `backup-${ts}.db`);

    // ---- SQLite-safe backup via VACUUM INTO (atomic, consistent snapshot) ----
    // If VACUUM INTO fails, we FAIL the backup — no fallback to unsafe file copy.
    try {
      await db.$executeRawUnsafe(`VACUUM INTO '${dest.replace(/'/g, "''")}'`);
    } catch (vacuumErr: any) {
      return fail(`خطا در ایجاد بکاپ امن: ${vacuumErr.message}. بکاپ ایجاد نشد.`, 500);
    }

    // ---- Verify backup was created ----
    const stat = await fs.stat(dest).catch(() => null);
    if (!stat || stat.size === 0) return fail("فایل بکاپ ساخته نشد یا خالی است.", 500);
    const size = stat.size;

    const rec = await db.backupRecord.create({
      data: { name: `backup-${ts}.db`, size, kind: "manual", path: dest },
    });
    await setSetting("backup.lastRun", new Date().toISOString(), "backup");
    await logActivity({ actor: "admin", action: "backup_create", target: rec.id, ip: getClientIp(req) });
    return ok({ backup: rec });
  } catch (e: any) {
    return fail("خطا در بکاپ.", 500, { detail: e?.message });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (id) {
    const rec = await db.backupRecord.findUnique({ where: { id } });
    if (rec?.path) {
      try {
        await fs.unlink(rec.path);
      } catch (err: any) {
        console.warn(`Backup file deletion failed: ${err.message}`);
      }
    }
    try {
      await db.backupRecord.delete({ where: { id } });
    } catch {
      // Record may already be deleted
    }
    await logActivity({ actor: "admin", action: "backup_delete", target: id, ip: getClientIp(req) });
  }
  return ok({ done: true });
}
