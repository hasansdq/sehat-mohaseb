import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const existing = await db.businessPackage.findUnique({ where: { id } });
  if (!existing) return fail("یافت نشد.", 404);
  const data: any = {};
  for (const k of ["name", "slug", "software", "category", "shortDesc", "description", "features", "badge", "icon"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.price !== undefined) data.price = body.price === null || body.price === "" ? null : Number(body.price);
  if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice === null || body.oldPrice === "" ? null : Number(body.oldPrice);
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  if (body.popular !== undefined) data.popular = !!body.popular;
  if (data.slug && data.slug !== existing.slug) {
    const dup = await db.businessPackage.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (dup) data.slug = `${data.slug}-${Math.random().toString(36).slice(2, 5)}`;
  }
  const updated = await db.businessPackage.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "package_update", target: id, ip: getClientIp(req) });
  return ok({ package: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.businessPackage.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "package_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
