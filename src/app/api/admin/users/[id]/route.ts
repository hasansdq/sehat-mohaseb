import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";
import { hashPassword } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) return fail("یافت نشد.", 404);
  const data: any = {};
  for (const k of ["fullName", "email", "company", "jobTitle", "avatarUrl"]) {
    if (body[k] !== undefined) data[k] = body[k] === null ? null : String(body[k]);
  }
  if (body.status !== undefined) data.status = body.status === "SUSPENDED" ? "SUSPENDED" : body.status === "PENDING" ? "PENDING" : "ACTIVE";
  if (body.role !== undefined) data.role = body.role === "ADMIN" ? "ADMIN" : "USER";
  if (body.password) {
    if (String(body.password).length < 6) return fail("رمز حداقل ۶ کاراکتر.", 422);
    data.passwordHash = hashPassword(String(body.password));
  }
  const updated = await db.user.update({ where: { id }, data, select: { id: true, mobile: true, fullName: true, role: true, status: true, email: true, company: true, jobTitle: true } });
  await logActivity({ actor: "admin", action: "user_update", target: id, ip: getClientIp(req) });
  return ok({ user: updated });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const { id } = await ctx.params;
  await db.user.delete({ where: { id } }).catch(() => null);
  await logActivity({ actor: "admin", action: "user_delete", target: id, ip: getClientIp(req) });
  return ok({ done: true });
}
