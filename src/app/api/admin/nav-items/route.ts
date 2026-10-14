import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const items = await db.navItem.findMany({ orderBy: { order: "asc" } });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const label = (body.label ?? "").toString().trim();
  const href = (body.href ?? "").toString().trim();
  if (!label || !href) return fail("برچسب و لینک الزامی است.", 422);
  const created = await db.navItem.create({
    data: {
      label,
      href,
      icon: body.icon || null,
      parentId: body.parentId || null,
      order: Number(body.order || 0),
      visible: body.visible !== false,
    },
  });
  await logActivity({ actor: "admin", action: "nav_item_create", target: created.id, ip: getClientIp(req) });
  return ok({ item: created });
}
