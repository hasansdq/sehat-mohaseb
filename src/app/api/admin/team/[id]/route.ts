import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const k of ["name", "role", "bio", "photoUrl", "linkedin", "email"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.order !== undefined) data.order = Number(body.order) || 0;
  const updated = await db.teamMember.update({ where: { id }, data });
  await logActivity({ actor: "admin", action: "team_update", target: id, ip: getClientIp(req) });
  return ok({ member: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.teamMember.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "team_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
