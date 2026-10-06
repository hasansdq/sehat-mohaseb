import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 500);
  const action = url.searchParams.get("action");
  const where: any = {};
  if (action) where.action = action;
  const items = await db.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, userId: true, actor: true, action: true, target: true, ip: true, userAgent: true, meta: true, createdAt: true },
  });
  return ok({ items });
}
