import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.suggestedPlan !== undefined) data.suggestedPlan = body.suggestedPlan;
  if (body.aiSummary !== undefined) data.aiSummary = body.aiSummary;
  const updated = await db.customPackageRequest.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "custom_package_update", target: id, ip: getClientIp(req) });
  return ok({ item: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.customPackageRequest.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "custom_package_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
