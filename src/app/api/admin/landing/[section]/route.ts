import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ section: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { section } = await ctx.params;
  const items = await db.landingBlock.findMany({ where: { section }, orderBy: { order: "asc" } });
  return ok({ items });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { section } = await ctx.params;
  await db.landingBlock.deleteMany({ where: { section } });
  await logActivity({ actor: "admin", action: "landing_section_delete", target: section, ip: getClientIp(req) });
  return ok({ done: true });
}
