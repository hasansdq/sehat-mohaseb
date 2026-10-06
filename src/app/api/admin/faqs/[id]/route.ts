import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.question !== undefined) data.question = String(body.question);
  if (body.answer !== undefined) data.answer = String(body.answer);
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  const updated = await db.faq.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "faq_update", target: id, ip: getClientIp(req) });
  return ok({ faq: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.faq.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "faq_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
