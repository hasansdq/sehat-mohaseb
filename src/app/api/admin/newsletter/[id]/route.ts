import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, requireAdmin, getClientIp, logActivity } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.newsletter.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "newsletter_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
