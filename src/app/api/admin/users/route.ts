import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireAdmin, getClientIp, logActivity } from "@/lib/api";
import { hashPassword, normalizeMobile, isValidMobile } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const role = url.searchParams.get("role");
  const where: any = {};
  if (role) where.role = role;
  if (q) where.OR = [{ mobile: { contains: q } }, { fullName: { contains: q } }];
  const items = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, mobile: true, fullName: true, email: true, role: true, status: true, company: true, jobTitle: true, createdAt: true, lastLoginAt: true, lastLoginIp: true },
  });
  return ok({ items });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ ok: false, error: "غیرمجاز" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const mobile = normalizeMobile(body.mobile ?? "");
  if (!isValidMobile(mobile)) return fail("موبایل نامعتبر.", 422);
  const password = body.password ?? "123456";
  const role = body.role === "ADMIN" ? "ADMIN" : "USER";
  const dup = await db.user.findUnique({ where: { mobile } });
  if (dup) return fail("موبایل تکراری.", 409);
  const created = await db.user.create({
    data: {
      mobile, passwordHash: hashPassword(String(password)), role,
      fullName: body.fullName || null, email: body.email || null,
      status: body.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    },
    select: { id: true, mobile: true, fullName: true, role: true, status: true, createdAt: true },
  });
  await logActivity({ actor: "admin", action: "user_create", target: created.id, ip: getClientIp(req) });
  return ok({ user: created });
}
