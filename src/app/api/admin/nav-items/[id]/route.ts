import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const k of ["label", "href", "icon", "parentId"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  if (body.visible !== undefined) data.visible = !!body.visible;
  const updated = await db.navItem.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "nav_item_update", target: id, ip: getClientIp(req) });
  return ok({ item: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  // also delete children if this is a parent
  await db.navItem.deleteMany({ where: { parentId: id } }).catch(() => null);
  await db.navItem.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "nav_item_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
