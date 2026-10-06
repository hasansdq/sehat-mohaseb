import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const existing = await db.service.findUnique({ where: { id } });
  if (!existing) return fail("یافت نشد.", 404);
  const data: any = {};
  for (const k of ["title", "slug", "shortDesc", "description", "icon", "image", "priceLabel"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  if (body.featured !== undefined) data.featured = !!body.featured;
  if (data.slug && data.slug !== existing.slug) {
    const dup = await db.service.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (dup) data.slug = `${data.slug}-${Math.random().toString(36).slice(2, 5)}`;
  }
  const updated = await db.service.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "service_update", target: id, ip: getClientIp(req) });
  return ok({ service: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.service.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "service_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
