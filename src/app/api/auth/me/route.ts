import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { getAuthContext } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const ctx = await getAuthContext(req);
  if (!ctx.user) return ok({ user: null });
  const u = await db.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true, mobile: true, fullName: true, email: true, role: true, status: true,
      avatarUrl: true, jobTitle: true, company: true, createdAt: true, lastLoginAt: true,
    },
  });
  return ok({ user: u });
}

export async function PUT(req: NextRequest) {
  const ctx = await getAuthContext(req);
  if (!ctx.user) return Response.json({ ok: false, error: "نشست یافت نشد." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.fullName !== undefined) data.fullName = String(body.fullName).trim() || null;
  if (body.email !== undefined) data.email = String(body.email).trim() || null;
  if (body.jobTitle !== undefined) data.jobTitle = String(body.jobTitle).trim() || null;
  if (body.company !== undefined) data.company = String(body.company).trim() || null;
  if (body.avatarUrl !== undefined) data.avatarUrl = String(body.avatarUrl).trim() || null;
  const updated = await db.user.update({ where: { id: ctx.user.id }, data, select: { id: true, mobile: true, fullName: true, email: true, jobTitle: true, company: true, avatarUrl: true } });
  return ok({ user: updated });
}
